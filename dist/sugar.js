"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopierSugar = void 0;
const client_1 = require("./client");
class CopierSugar {
    req = {
        copySl: true,
        copyTp: true,
        copyPendingOrders: false,
        reverseCopy: false
    };
    endpoint = 'copy.mrpc.pro:443';
    static create() { return new CopierSugar(); }
    withEndpoint(endpoint) {
        this.endpoint = endpoint;
        return this;
    }
    withCredentials(userKey, managerKey) {
        this.req.userKey = userKey;
        this.req.managerKey = managerKey || userKey;
        return this;
    }
    fromMaster(master) { this.req.master = master; return this; }
    toSlave(slave) { this.req.slave = slave; return this; }
    withLotMultiplier(val) { this.req.riskType = 'LotMultiplier'; this.req.riskValue = val.toString(); return this; }
    withFixedLot(val) { this.req.riskType = 'FixedLot'; this.req.riskValue = val.toString(); return this; }
    withCopySl(val = true) { this.req.copySl = val; return this; }
    withCopyTp(val = true) { this.req.copyTp = val; return this; }
    withCopyPendingOrders(val = true) { this.req.copyPendingOrders = val; return this; }
    withReverseCopy(val = true) { this.req.reverseCopy = val; return this; }
    async start() {
        const svc = new client_1.CopierService(this.endpoint, { userKey: this.req.userKey, managerKey: this.req.managerKey });
        return svc.start(this.req);
    }
}
exports.CopierSugar = CopierSugar;
