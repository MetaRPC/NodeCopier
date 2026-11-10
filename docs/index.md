---
hide:
  - toc
---
<div class="hero"><span class="eyebrow">METARPC / DEVELOPER GUIDES</span><h1>Trade copying.<br>Built with Node.js / TypeScript.</h1><p>From your first authenticated request to a monitored master–follower workflow. Clear examples, explicit sizing and practical recovery.</p><a class="md-button md-button--primary" href="quickstart/">Start building →</a> <a class="md-button" href="reference/">Explore the API</a><div class="hero-meta">TLS transport · Owner authentication · Demo-first validation</div></div>

<div class="grid cards" markdown>

- **01 · Connect with confidence**

    Understand keys, account IDs and transport before sending a request.

    [Authentication →](authentication.md)

- **02 · Control the lifecycle**

    Start once, inspect state, pause and clean up your test.

    [Copier lifecycle →](lifecycle.md)

- **03 · Make sizing explicit**

    Choose lot, balance or equity sizing and account for broker constraints.

    [Sizing and settings →](sizing.md)

- **04 · Diagnose the result**

    Separate network success from management success and broker execution.

    [Troubleshooting →](troubleshooting.md)

</div>

## Your first successful request

Requires Node.js 20+ and npm. Install dependencies and run the read-only List example. Keep your key in `MRPC_API_KEY`.

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

[Full setup](quickstart.md) · [Testing guide](testing.md) · [All SDKs](sdks.md)
