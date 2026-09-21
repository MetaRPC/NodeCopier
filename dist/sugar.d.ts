import { StartReply, Account } from './models';
export declare class CopierSugar {
    private req;
    private endpoint;
    static create(): CopierSugar;
    withEndpoint(endpoint: string): this;
    withCredentials(userKey: string): this;
    fromMaster(master: Account): this;
    toSlave(slave: Account): this;
    withLotMultiplier(val: number): this;
    withFixedLot(val: number): this;
    withCopySl(val?: boolean): this;
    withCopyTp(val?: boolean): this;
    withCopyPendingOrders(val?: boolean): this;
    withReverseCopy(val?: boolean): this;
    start(): Promise<StartReply>;
}
