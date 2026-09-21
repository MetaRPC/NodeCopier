import WebSocket from 'ws';
import { StartRequest, StartReply, ListReply, SimpleReply, TradeLog } from './models';
import { CopierAccount } from './account';
export declare class CopierService {
    readonly account: CopierAccount;
    readonly endpoint: string;
    private grpcClient;
    constructor(endpoint: string | undefined, options: {
        userKey: string;
        managerKey?: string;
    } | string);
    private getMetadata;
    start(req: StartRequest): Promise<StartReply>;
    list(userKey?: string): Promise<ListReply>;
    pause(copierId: string, paused: boolean): Promise<SimpleReply>;
    remove(copierId: string): Promise<SimpleReply>;
    streamTradeLogs(copierId: string, onMessage: (log: TradeLog) => void, onError?: (err: Error) => void): {
        ws: WebSocket;
        close: () => void;
    };
    close(): void;
}
