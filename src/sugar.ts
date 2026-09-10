import { StartRequest, StartReply, Account } from './models';
import { CopierService } from './client';

export class CopierSugar {
    private req: Partial<StartRequest> = {};
    private endpoint = 'copy.mrpc.pro:443';

    static create() { return new CopierSugar(); }

    withCredentials(userKey: string, managerKey?: string) {
        this.req.userKey = userKey;
        this.req.managerKey = managerKey || userKey;
        return this;
    }

    fromMaster(master: Account) { this.req.master = master; return this; }
    toSlave(slave: Account) { this.req.slave = slave; return this; }
    withLotMultiplier(val: number) { this.req.riskType = 'LotMultiplier'; this.req.riskValue = val.toString(); return this; }
    withFixedLot(val: number) { this.req.riskType = 'FixedLot'; this.req.riskValue = val.toString(); return this; }

    async start(): Promise<StartReply> {
        const svc = new CopierService(this.endpoint, { userKey: this.req.userKey!, managerKey: this.req.managerKey });
        return svc.start(this.req as StartRequest);
    }
}
