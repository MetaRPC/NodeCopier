export interface OpenDemoAccountParams {
    company?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    server: string;
    accountType?: string;
    timeoutSeconds?: number;
}

export interface DemoAccountResult {
    resultCode: number;
    login: number;
    password: string;
    investor: string;
    server: string;
    debugLog?: string;
}

export interface ConnectExResult {
    terminalInstanceGuid: string;
    terminalType: string;
}

export interface DisconnectResult {
    uniqueIdentifier: string;
    lifetimeSeconds: number;
}

export class DemoAccountClient {
    private baseHttpUrl: string;

    constructor(endpoint: string = 'https://mt5.mrpc.pro') {
        const clean = endpoint.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '').replace(/:443$/, '');
        this.baseHttpUrl = `https://${clean}`;
    }

    async openDemoAccount(params: OpenDemoAccountParams, apiKey: string = 'TRIAL'): Promise<DemoAccountResult> {
        const url = `${this.baseHttpUrl}/DemoAccount/Open?server=${encodeURIComponent(params.server)}`;
        const res = await fetch(url, {
            headers: {
                'APIKey': apiKey,
                'User-Agent': 'NodeCopier/1.0.0'
            }
        });
        if (!res.ok) {
            throw new Error(`DemoAccount/Open failed with HTTP ${res.status}: ${res.statusText}`);
        }
        const data: any = await res.json();
        return {
            resultCode: data.resultCode || 0,
            login: Number(data.login),
            password: data.password,
            investor: data.investor,
            server: data.server || params.server,
            debugLog: data.debugLog
        };
    }

    async connectEx(user: number, password: string, server: string = 'MetaQuotes-Demo', apiKey: string = 'TRIAL'): Promise<ConnectExResult> {
        const params = new URLSearchParams({
            user: String(user),
            password,
            mtClusterName: server
        });
        const url = `${this.baseHttpUrl}/ConnectEx?${params.toString()}`;
        const res = await fetch(url, {
            headers: {
                'APIKey': apiKey,
                'User-Agent': 'NodeCopier/1.0.0'
            }
        });
        if (!res.ok) {
            throw new Error(`ConnectEx failed with HTTP ${res.status}: ${res.statusText}`);
        }
        const data: any = await res.json();
        return {
            terminalInstanceGuid: data?.data?.terminalInstanceGuid || '',
            terminalType: data?.data?.terminalType || 'MT5'
        };
    }

    async disconnect(terminalId: string, apiKey: string = 'TRIAL'): Promise<DisconnectResult> {
        const url = `${this.baseHttpUrl}/Disconnect`;
        const res = await fetch(url, {
            headers: {
                'APIKey': apiKey,
                'id': terminalId,
                'User-Agent': 'NodeCopier/1.0.0'
            }
        });
        if (!res.ok) {
            throw new Error(`Disconnect failed with HTTP ${res.status}: ${res.statusText}`);
        }
        const data: any = await res.json();
        return {
            uniqueIdentifier: data?.data?.uniqueIdentifier || '',
            lifetimeSeconds: data?.data?.fullLifeTimeSeconds || 0
        };
    }

    async orderSend(terminalId: string, symbol: string, operation: string, volume: number, apiKey: string = 'TRIAL'): Promise<any> {
        const params = new URLSearchParams({
            id: terminalId,
            symbol,
            operation,
            volume: String(volume)
        });
        const url = `${this.baseHttpUrl}/OrderSend?${params.toString()}`;
        const res = await fetch(url, {
            headers: {
                'APIKey': apiKey,
                'id': terminalId,
                'User-Agent': 'NodeCopier/1.0.0'
            }
        });
        if (!res.ok) throw new Error(`OrderSend failed: HTTP ${res.status}`);
        return await res.json();
    }

    async openedOrders(terminalId: string, apiKey: string = 'TRIAL'): Promise<any[]> {
        const url = `${this.baseHttpUrl}/OpenedOrders?id=${encodeURIComponent(terminalId)}`;
        const res = await fetch(url, {
            headers: {
                'APIKey': apiKey,
                'id': terminalId,
                'User-Agent': 'NodeCopier/1.0.0'
            }
        });
        if (!res.ok) throw new Error(`OpenedOrders failed: HTTP ${res.status}`);
        const data: any = await res.json();
        return data?.data?.positionInfos || [];
    }

    async orderClose(terminalId: string, ticket: number, apiKey: string = 'TRIAL'): Promise<any> {
        const params = new URLSearchParams({
            id: terminalId,
            ticket: String(ticket),
            volume: '0',
            slippage: '20'
        });
        const url = `${this.baseHttpUrl}/OrderClose?${params.toString()}`;
        const res = await fetch(url, {
            headers: {
                'APIKey': apiKey,
                'id': terminalId,
                'User-Agent': 'NodeCopier/1.0.0'
            }
        });
        if (!res.ok) throw new Error(`OrderClose failed: HTTP ${res.status}`);
        return await res.json();
    }
}

export function toHyphenGuid(guid: string): string {
    const clean = guid.replace('mt5_live_', '').replace(/-/g, '');
    if (clean.length === 32) {
        return `${clean.substring(0, 8)}-${clean.substring(8, 12)}-${clean.substring(12, 16)}-${clean.substring(16, 20)}-${clean.substring(20, 32)}`;
    }
    return guid;
}
