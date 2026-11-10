# First request with Node.js / TypeScript

List your own copiers to check connectivity and identity without creating a terminal or placing a trade.

## 1. Install

Requires **Node.js 20+ and npm**. These instructions build from source; they do not assume a registry release exists.

```bash
git clone https://github.com/MetaRPC/NodeCopier.git
cd NodeCopier
npm ci
npm run build
npm test
```



## 2. Set your owner key

=== "Bash"
    ```bash
    export MRPC_API_KEY='your-owner-key'
    ```
=== "PowerShell"
    ```powershell
    $env:MRPC_API_KEY = 'your-owner-key'
    ```

Use the real owner API key, not a broker password, terminal ID or `TRIAL`. Read [authentication](authentication.md) if access is refused.

## 3. Run

```bash
node examples/list.js
```

Source: [`examples/list.js`](https://github.com/MetaRPC/NodeCopier/blob/main/examples/list.js).

```javascript
const { CopierService } = require('../dist');
(async () => {
  const service = new CopierService('copy.mrpc.pro:443', { userKey: process.env.MRPC_API_KEY });
  try {
    const result = await service.list();
    if (!result.ok) throw new Error(result.error);
    for (const copier of result.copiers) console.log(copier.id, copier.paused);
  } finally { service.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
```

A successful empty list means this owner has no copiers. Treat failed requests as errors, not empty accounts.

## 4. Prepare a demo workflow

Read [the lifecycle guide](lifecycle.md), then [choose sizing](sizing.md). Existing replication examples under `examples/` are advanced integration examples: they may provision accounts and trade. Inspect them and their cleanup before running with disposable demos. List is the default starting point.
