export class DemoAccountClient {
    constructor(private endpoint: string = 'https://mt5.mrpc.pro:443') {}

    async openDemoAccount(params: { company?: string; firstName?: string; lastName?: string; email?: string; server: string }) {
        const rnd = Math.floor(100000 + Math.random() * 900000);
        return {
            resultCode: 0,
            login: rnd,
            password: `Demo${Math.floor(1000 + Math.random() * 9000)}!`,
            investor: `Inv${Math.floor(1000 + Math.random() * 9000)}!`,
            server: params.server
        };
    }
}
