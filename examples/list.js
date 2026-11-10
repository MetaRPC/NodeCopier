const { CopierService } = require('../dist');
(async () => {
  const service = new CopierService('copy.mrpc.pro:443', { userKey: process.env.MRPC_API_KEY });
  try {
    const result = await service.list();
    if (!result.ok) throw new Error(result.error);
    for (const copier of result.copiers) console.log(copier.id, copier.paused);
  } finally { service.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
