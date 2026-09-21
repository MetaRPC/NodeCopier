import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import WebSocket from 'ws';
import { Account, StartRequest, StartReply, ListReply, SimpleReply, TradeLog } from './models';
import { CopierAccount } from './account';

export class CopierService {
    public readonly account: CopierAccount;
    public readonly endpoint: string;
    private grpcClient: any;

    constructor(endpoint: string = 'copy.mrpc.pro:443', options: { userKey: string; managerKey?: string } | string) {
        const userKey = typeof options === 'string' ? options : options.userKey;
        this.endpoint = endpoint;
        this.account = new CopierAccount(endpoint, userKey);

        const cleanEndpoint = endpoint.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
        const credentials = (cleanEndpoint.includes(':443') || cleanEndpoint.endsWith('443') || !cleanEndpoint.includes(':'))
            ? grpc.credentials.createSsl()
            : grpc.credentials.createInsecure();

        const protoPath = path.resolve(__dirname, '../proto/copier.proto');
        const pkgDef = protoLoader.loadSync(protoPath, {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
        const descriptor = grpc.loadPackageDefinition(pkgDef) as any;
        this.grpcClient = new descriptor.copier.CopierService(cleanEndpoint, credentials);
    }

    private getMetadata(): grpc.Metadata {
        const meta = new grpc.Metadata();
        meta.set('authorization', `Bearer ${this.account.userKey}`);
        meta.set('x-metarpc-client-sdk', 'NodeCopier/1.0.0');
        return meta;
    }

    async start(req: StartRequest): Promise<StartReply> {
        const userKey = req.userKey || this.account.userKey;
        const request = {
            userKey,
            managerKey: req.managerKey || userKey,
            master: req.master,
            slave: req.slave,
            riskType: req.riskType,
            riskValue: req.riskValue,
            fixedMasterBalance: req.fixedMasterBalance || '',
            copySl: req.copySl ?? true,
            copyTp: req.copyTp ?? true,
            copyPendingOrders: req.copyPendingOrders ?? false,
            reverseCopy: req.reverseCopy ?? false
        };

        return new Promise<StartReply>((resolve) => {
            const meta = this.getMetadata();
            const deadline = new Date(Date.now() + 15000);
            this.grpcClient.start(request, meta, { deadline }, (err: any, response: any) => {
                if (err) {
                    return resolve({
                        ok: false,
                        copierId: '',
                        error: err.details || err.message
                    });
                }
                resolve({
                    ok: response.ok,
                    copierId: response.copierId,
                    error: response.error
                });
            });
        });
    }

    async list(userKey?: string): Promise<ListReply> {
        const request = {
            userKey: userKey || this.account.userKey
        };

        return new Promise<ListReply>((resolve) => {
            const meta = this.getMetadata();
            const deadline = new Date(Date.now() + 10000);
            this.grpcClient.list(request, meta, { deadline }, (err: any, response: any) => {
                if (err) {
                    return resolve({
                        ok: false,
                        copiers: [],
                        error: err.details || err.message
                    });
                }
                resolve({
                    ok: response.ok,
                    copiers: response.copiers || [],
                    error: response.error
                });
            });
        });
    }

    async pause(copierId: string, paused: boolean): Promise<SimpleReply> {
        const request = {
            userKey: this.account.userKey,
            copierId,
            paused
        };

        return new Promise<SimpleReply>((resolve) => {
            const meta = this.getMetadata();
            const deadline = new Date(Date.now() + 10000);
            this.grpcClient.pause(request, meta, { deadline }, (err: any, response: any) => {
                if (err) {
                    return resolve({
                        ok: false,
                        error: err.details || err.message
                    });
                }
                resolve({
                    ok: response.ok,
                    error: response.error
                });
            });
        });
    }

    async remove(copierId: string): Promise<SimpleReply> {
        const request = {
            userKey: this.account.userKey,
            copierId
        };

        return new Promise<SimpleReply>((resolve) => {
            const meta = this.getMetadata();
            const deadline = new Date(Date.now() + 10000);
            this.grpcClient.remove(request, meta, { deadline }, (err: any, response: any) => {
                if (err) {
                    return resolve({
                        ok: false,
                        error: err.details || err.message
                    });
                }
                resolve({
                    ok: response.ok,
                    error: response.error
                });
            });
        });
    }

    streamTradeLogs(
        copierId: string,
        onMessage: (log: TradeLog) => void,
        onError?: (err: Error) => void
    ): { ws: WebSocket; close: () => void } {
        const cleanEndpoint = this.endpoint.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
        const isSecure = cleanEndpoint.includes(':443') || cleanEndpoint.endsWith('443') || !cleanEndpoint.includes(':');
        const proto = isSecure ? 'wss' : 'ws';
        const url = `${proto}://${cleanEndpoint}/OnTradeLog?id=${encodeURIComponent(copierId)}`;

        const ws = new WebSocket(url, {
            headers: this.account.getAuthMetadata()
        });

        ws.on('message', (data: WebSocket.Data) => {
            try {
                const text = data.toString();
                const log = JSON.parse(text) as TradeLog;
                onMessage(log);
            } catch (e) {
                if (onError) onError(e as Error);
            }
        });

        if (onError) {
            ws.on('error', onError);
        }

        return {
            ws,
            close: () => {
                try {
                    ws.close();
                } catch {}
            }
        };
    }

    close(): void {
        try {
            if (this.grpcClient) {
                this.grpcClient.close();
            }
        } catch {}
    }
}
