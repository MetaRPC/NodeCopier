import { CopierService, DemoAccountClient } from '../src';

async function main() {
    console.log('=== NodeCopier Quick Start Demo ===');
    const apiKey = 'TRIAL';
    const demo = new DemoAccountClient('https://mt5.mrpc.pro');

    // 1. Provision live demo account
    console.log('\n[1] Provisioning live demo account on MetaQuotes-Demo...');
    const master = await demo.openDemoAccount({ server: 'MetaQuotes-Demo' }, apiKey);
    console.log(`    Master account created: #${master.login} (Server: ${master.server})`);

    // 2. Connect terminal via ConnectEx with APIKey: TRIAL
    console.log(`\n[2] Connecting terminal via ConnectEx (APIKey: ${apiKey})...`);
    const conn = await demo.connectEx(master.login, master.password, master.server, apiKey);
    console.log(`    Terminal Connected! Instance GUID: ${conn.terminalInstanceGuid}`);

    // 3. Interacting with Copier Service
    console.log(`\n[3] Interacting with Copier Service (userKey: ${apiKey})...`);
    const copier = new CopierService('copy.mrpc.pro:443', { userKey: apiKey });
    const listReply = await copier.list();
    console.log(`    Active copiers for ${apiKey}: ${listReply.copiers?.length || 0}`);

    // 4. Cleanly Disconnect Terminal Session
    console.log(`\n[4] Disconnecting terminal session ${conn.terminalInstanceGuid}...`);
    const disc = await demo.disconnect(conn.terminalInstanceGuid, apiKey);
    console.log(`    Terminal Cleanly Disconnected: ${disc.uniqueIdentifier} (Lifetime: ${disc.lifetimeSeconds}s)`);

    await copier.close();
    console.log('\n=== NodeCopier Quick Start Completed Successfully ===');
}

main().catch((err) => {
    console.error('Error in quickstart:', err);
    process.exit(1);
});
