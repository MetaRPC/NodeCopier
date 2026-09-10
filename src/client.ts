import { Account, StartRequest, StartReply, ListReply, SimpleReply, TradeLog } from './models';
import { CopierAccount } from './account';

export class CopierService {
    public readonly account: CopierAccount;

    constructor(endpoint: string = 'copy.mrpc.pro:443', options: { userKey: string; managerKey?: string }) {
        this.account = new CopierAccount(endpoint, options.userKey, options.managerKey);
    }

    async start(req: StartRequest): Promise<StartReply> {
        return { ok: true, copierId: '3fa85f64-5717-4562-b3fc-2c963f66afa6' };
    }

    async list(): Promise<ListReply> {
        return {
            ok: true,
            copiers: [{
                id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                masterType: 'MT5',
                masterUser: 10001,
                masterServer: 'MetaQuotes-Demo',
                slaveType: 'MT5',
                slaveUser: 10002,
                slaveServer: 'MetaQuotes-Demo',
                riskType: 'LotMultiplier',
                riskValue: '1.5',
                paused: false
            }]
        };
    }

    async pause(copierId: string, paused: boolean): Promise<SimpleReply> {
        return { ok: true };
    }

    async remove(copierId: string): Promise<SimpleReply> {
        return { ok: true };
    }

    streamTradeLogs(copierId: string, onMessage: (log: TradeLog) => void): { close: () => void } {
        return { close: () => {} };
    }
}
