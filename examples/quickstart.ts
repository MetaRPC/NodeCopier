import { CopierService, DemoAccountClient, toHyphenGuid } from '../src';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('=== NodeCopier Trade Replication Quick Start ===');
    const apiKey = 'TRIAL';
    const demo = new DemoAccountClient('https://mt5.mrpc.pro');
    let masterGuid: string | null = null;
    let slaveGuid: string | null = null;
    let copierId: string | null = null;
    const copier = new CopierService('copy.mrpc.pro:443', { userKey: apiKey });

    try {
        // 1. Provision live demo accounts
        console.log('\n[1] Provisioning live demo accounts on MetaQuotes-Demo...');
        const master = await demo.openDemoAccount({ server: 'MetaQuotes-Demo' }, apiKey);
        console.log(`    Master Account Provisioned: #${master.login} (Server: ${master.server})`);
        await sleep(1000);

        const slave = await demo.openDemoAccount({ server: 'MetaQuotes-Demo' }, apiKey);
        console.log(`    Slave Account Provisioned:  #${slave.login} (Server: ${slave.server})`);
        await sleep(1000);

        // 2. Connect terminals via ConnectEx with APIKey: TRIAL
        console.log(`\n[2] Connecting terminals via ConnectEx (APIKey: ${apiKey})...`);
        const connMaster = await demo.connectEx(master.login, master.password, master.server, apiKey);
        masterGuid = connMaster.terminalInstanceGuid;
        console.log(`    Master Terminal Connected! GUID: ${masterGuid}`);

        const connSlave = await demo.connectEx(slave.login, slave.password, slave.server, apiKey);
        slaveGuid = connSlave.terminalInstanceGuid;
        console.log(`    Slave Terminal Connected!  GUID: ${slaveGuid}`);

        const masterSessionId = toHyphenGuid(masterGuid);
        const slaveSessionId = toHyphenGuid(slaveGuid);

        // 3. Start Copier via gRPC on copy.mrpc.pro:443
        console.log(`\n[3] Starting Trade Copier via gRPC on copy.mrpc.pro:443...`);
        const startRep = await copier.start({
            userKey: apiKey,
            riskType: 'LotMultiplier',
            riskValue: '1.0',
            master: {
                type: 'MT5',
                user: master.login,
                password: master.password,
                server: master.server,
                id: masterSessionId
            },
            slave: {
                type: 'MT5',
                user: slave.login,
                password: slave.password,
                server: slave.server,
                id: slaveSessionId
            }
        });

        console.log(`    gRPC Start Reply: ok=${startRep.ok}, copierId=${startRep.copierId}, error=${startRep.error || 'none'}`);
        if (!startRep.ok) {
            throw new Error(`Failed to start trade copier: ${startRep.error}`);
        }
        copierId = startRep.copierId;

        // Allow copier to subscribe and sync trade streams
        await sleep(3000);

        // 4. Open trade on Master
        console.log('\n[4] Opening Market Order on Master (0.01 EURUSD BUY)...');
        const orderRes = await demo.orderSend(masterGuid, 'EURUSD', 'TMT5_ORDER_TYPE_BUY', 0.01, apiKey);
        const masterTicket = orderRes?.data?.order || orderRes?.data?.ticket || orderRes?.ticket;
        console.log(`    Master Order Placed! Ticket: ${masterTicket}`);

        // 5. Confirm trade copied to Slave
        console.log('\n[5] Verifying replicated trade on Slave account...');
        let replicated = false;
        let slaveTicket: number | null = null;
        for (let attempt = 1; attempt <= 15; attempt++) {
            await sleep(2000);
            const positions = await demo.openedOrders(slaveGuid, apiKey);
            console.log(`    Attempt ${attempt}: Slave active positions count = ${positions.length}`);
            if (positions.length > 0) {
                const pos = positions[0];
                slaveTicket = pos.ticket;
                console.log(`    --> CONFIRMED ON SLAVE: Ticket=${pos.ticket}, Symbol=${pos.symbol}, Volume=${pos.volume}, Type=${pos.type}`);
                replicated = true;
                break;
            }
        }

        if (!replicated) {
            console.log('    WARNING: Slave trade replication timed out.');
        } else {
            console.log('    SUCCESS: Trade successfully replicated to slave account!');
        }

        // 6. Close position on Master
        if (masterTicket) {
            console.log(`\n[6] Closing Master trade ticket #${masterTicket}...`);
            const closeRes = await demo.orderClose(masterGuid, masterTicket, apiKey);
            console.log(`    Master OrderClose result: ${closeRes?.data?.returnedStringCode || 'DONE'}`);

            // 7. Confirm trade closed on Slave
            console.log('\n[7] Verifying trade closed on Slave...');
            for (let attempt = 1; attempt <= 15; attempt++) {
                await sleep(2000);
                const positions = await demo.openedOrders(slaveGuid, apiKey);
                if (positions.length === 0) {
                    console.log('    SUCCESS: Slave position closed by trade copier!');
                    break;
                }
                console.log(`    Attempt ${attempt}: Slave positions still open: ${positions.length}`);
            }
        }

        // 8. Remove Copier via gRPC
        if (copierId) {
            console.log(`\n[8] Removing Copier ${copierId} via gRPC...`);
            const remRep = await copier.remove(copierId);
            console.log(`    Copier Remove Reply: ok=${remRep.ok}`);
        }

    } finally {
        // 9. Cleanly Disconnect Terminal Sessions
        console.log('\n[9] Disconnecting terminal sessions cleanly via /Disconnect...');
        if (masterGuid) {
            try {
                const discM = await demo.disconnect(masterGuid, apiKey);
                console.log(`    Master Terminal Cleanly Disconnected: ${discM.uniqueIdentifier} (Lifetime: ${discM.lifetimeSeconds}s)`);
            } catch (e: any) {
                console.log(`    Master disconnect error: ${e.message}`);
            }
        }
        if (slaveGuid) {
            try {
                const discS = await demo.disconnect(slaveGuid, apiKey);
                console.log(`    Slave Terminal Cleanly Disconnected:  ${discS.uniqueIdentifier} (Lifetime: ${discS.lifetimeSeconds}s)`);
            } catch (e: any) {
                console.log(`    Slave disconnect error: ${e.message}`);
            }
        }
        copier.close();
        console.log('\n=== NodeCopier Trade Replication Completed Successfully ===');
    }
}

main().catch((err) => {
    console.error('Error in quickstart:', err);
    process.exit(1);
});
