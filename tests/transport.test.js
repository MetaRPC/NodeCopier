const test = require('node:test');
const assert = require('node:assert/strict');
const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const { WebSocketServer } = require('ws');
const { CopierService, CopierAccount } = require('../dist');
const descriptor = grpc.loadPackageDefinition(loader.loadSync('proto/copier.proto', { keepCase:false, longs:String, defaults:true })).copier;

test('every RPC sends ApiKey, owner identity and a deadline; errors remain failures', async () => {
  const calls = [];
  const server = new grpc.Server();
  const handle = name => (call, callback) => {
    assert.deepEqual(call.metadata.get('apikey'), ['owner-test']);
    assert.equal(call.request.userKey, 'owner-test');
    assert.notEqual(call.getDeadline(), Infinity);
    calls.push([name, call.request]);
    if (name === 'Remove') return callback({ code: grpc.status.PERMISSION_DENIED, details:'denied' });
    callback(null, {ok:true, copierId:'copier-test', copiers:[]});
  };
  server.addService(descriptor.CopierService.service, {Start:handle('Start'),List:handle('List'),Pause:handle('Pause'),Remove:handle('Remove')});
  const port = await new Promise((resolve,reject)=>server.bindAsync('127.0.0.1:0',grpc.ServerCredentials.createInsecure(),(e,p)=>e?reject(e):resolve(p)));
  const service = new CopierService(`http://127.0.0.1:${port}`, {userKey:'owner-test', managerKey:'manager-test'});
  try {
    const account = {type:'MT5',user:'9007199254740993',password:'demo-only',server:'Demo',id:'',name:''};
    assert.equal((await service.start({master:account,slave:account,riskType:'FixedLot',riskValue:'0.01',copySl:false,copyTp:true})).ok,true);
    assert.equal((await service.list()).ok,true);
    assert.equal((await service.pause('copier-test',false)).ok,true);
    const failure=await service.remove('copier-test');
    assert.equal(failure.ok,false);assert.match(failure.error,/denied/);
    assert.equal(calls.length,4);
    assert.equal(calls[0][1].master.user,'9007199254740993');
    assert.equal(calls[0][1].managerKey,'manager-test');
    assert.equal(calls[0][1].copySl,false);assert.equal(calls[0][1].copyTp,true);
    assert.equal(calls[2][1].paused,false);
    const provider = (type, id) => ({type, id, user:'123', password:'', server:`${type}-demo`});
    const ctId = '0123456789abcdef0123456789abcdef';
    const tlId = 'fedcba9876543210fedcba9876543210';
    assert.equal((await service.start({master:provider('CT',ctId),slave:provider('TL',tlId),riskType:'FixedLot',riskValue:'0.01'})).ok,true);
    assert.equal(calls[4][1].master.type,'CT');
    assert.equal(calls[4][1].slave.type,'TL');
    assert.equal(calls[4][1].master.id,ctId);
    assert.equal(calls[4][1].slave.id,tlId);
  } finally { service.close();server.forceShutdown(); }
});

test('WebSocket authenticates at the configured host and preserves real messages',async()=>{
  const server = new WebSocketServer({port:0});
  await new Promise(resolve=>server.on('listening',resolve));
  server.on('connection',(ws,request)=>{
    assert.equal(request.headers.apikey,'owner-test');
    assert.equal(request.url,'/OnTradeLog?id=copier%20test');
    ws.send(JSON.stringify({copierId:'copier test',slaveTicket:'9007199254740993',success:false,exceptionCode:'TEST'}));
  });
  const service = new CopierService(`http://127.0.0.1:${server.address().port}`, 'owner-test');
  let stream;
  try {
    const result=await new Promise((resolve,reject)=>{stream=service.streamTradeLogs('copier test',resolve,reject);});
    assert.equal(result.slaveTicket,'9007199254740993');assert.equal(result.success,false);
  } finally { if(stream)stream.ws.terminate();service.close();await new Promise(resolve=>server.close(resolve)); }
});

test('invalid owner keys are rejected before connection',()=>{
  for(const key of ['', 'TRIAL','trial','x\r\nInjected: yes','has space']) assert.throws(()=>new CopierAccount('copy.mrpc.pro',key));
});

test('WebSocket keeps unquoted 64-bit broker tickets exact at every nesting level',async()=>{
  const server = new WebSocketServer({port:0});
  await new Promise(resolve=>server.on('listening',resolve));
  server.on('connection',ws=>ws.send('{"masterOrder":{"ticket":432345564230835570,"lots":0.01},"slaveTicket":9007199254740993,"negative":-9007199254740993,"safe":9007199254740991,"success":true,"comment":"ticket 432345564230835570"}'));
  const service = new CopierService(`http://127.0.0.1:${server.address().port}`, 'owner-test');
  let stream;
  try {
    const result=await new Promise((resolve,reject)=>{stream=service.streamTradeLogs('test',resolve,reject);});
    assert.equal(result.masterOrder.ticket,'432345564230835570');
    assert.equal(result.slaveTicket,'9007199254740993');
    assert.equal(result.negative,'-9007199254740993');
    assert.equal(result.safe,9007199254740991);
    assert.equal(result.masterOrder.lots,0.01);
    assert.equal(result.success,true);
    assert.equal(result.comment,'ticket 432345564230835570');
    assert.equal(JSON.parse(JSON.stringify(result)).masterOrder.ticket,'432345564230835570');
  } finally { if(stream)stream.ws.terminate();service.close();await new Promise(resolve=>server.close(resolve)); }
});
