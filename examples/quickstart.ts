import { CopierService, DemoAccountClient } from '../src';

async function main() {
    console.log('=== NodeCopier Quick Start ===');
    const demo = new DemoAccountClient();
    const master = await demo.openDemoAccount({ server: 'MetaQuotes-Demo' });
    const slave = await demo.openDemoAccount({ server: 'MetaQuotes-Demo' });
    console.log(`Created demo accounts: Master=${master.login}, Slave=${slave.login}`);

    const copier = new CopierService('copy.mrpc.pro:443', { userKey: 'YOUR_USER_KEY' });
    const reply = await copier.start({
        userKey: 'YOUR_USER_KEY',
        master: { type: 'MT5', user: master.login, password: master.password, server: master.server },
        slave: { type: 'MT5', user: slave.login, password: slave.password, server: slave.server },
        riskType: 'LotMultiplier',
        riskValue: '1.5'
    });
    console.log(`Copier started: ${reply.copierId}`);
}

main().catch(console.error);
