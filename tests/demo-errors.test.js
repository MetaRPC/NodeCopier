const test=require('node:test');
const assert=require('node:assert/strict');
const {DemoAccountClient}=require('../dist');
test('HTTP 200 error envelopes fail every terminal helper instead of reporting empty success',async()=>{
 const original=global.fetch;
 global.fetch=async()=>new Response(JSON.stringify({error:{errorCode:'MAX_TERMINALS_PER_POD_REACHED',stackTrace:'private trace'}}),{status:200});
 try{
  const c=new DemoAccountClient();
  const calls=[()=>c.openDemoAccount({server:'MetaQuotes-Demo'},'test-key'),()=>c.connectEx(123,'secret','MetaQuotes-Demo','test-key'),()=>c.disconnect('id','test-key'),()=>c.orderSend('id','EURUSD','Buy',.01,'test-key'),()=>c.openedOrders('id','test-key'),()=>c.orderClose('id',123,'test-key')];
  for(const call of calls)await assert.rejects(call,e=>e.message.includes('MAX_TERMINALS_PER_POD_REACHED')&&!e.message.includes('private trace'));
 }finally{global.fetch=original;}
});
