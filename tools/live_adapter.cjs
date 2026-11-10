// Secrets arrive on stdin, never in command-line arguments.
const {CopierService}=require('../dist');
const fs=require('node:fs');
const v=fs.readFileSync(0,'utf8').trimEnd().split(/\r?\n/);
(async()=>{
 const c=new CopierService(v[0],{userKey:v[1]});
 try {
  const op=process.argv[2];let r;
  const account=i=>({type:'MT5',user:v[i],password:v[i+1],server:v[i+2],id:v[i+3]});
  if(op==='start')r=await c.start({master:account(2),slave:account(6),riskType:v[10],riskValue:v[11],fixedMasterBalance:v[12]||'',copySl:true,copyTp:true});
  else if(op==='stream'){
   await new Promise((resolve,reject)=>{
    const stream=c.streamTradeLogs(process.argv[3],log=>console.log(JSON.stringify(log)),reject);
    stream.ws.on('close',resolve);
   });
   return;
  }
  else if(op==='list')r=await c.list();
  else if(op==='pause')r=await c.pause(process.argv[3],process.argv[4]==='true');
  else if(op==='remove')r=await c.remove(process.argv[3]);
  else throw new Error('Unknown operation');
  console.log(JSON.stringify(r));
 } finally {c.close();}
})().catch(e=>{console.log(JSON.stringify({ok:false,error:e.message}));process.exitCode=1});
