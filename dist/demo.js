"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoAccountClient = void 0;
exports.toHyphenGuid = toHyphenGuid;
class DemoAccountClient {
    baseHttpUrl;
    constructor(endpoint = 'https://mt5.mrpc.pro') {
        const clean = endpoint.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '').replace(/:443$/, '');
        this.baseHttpUrl = `https://${clean}`;
    }
    async openDemoAccount(params, apiKey = 'TRIAL') {
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
        const data = await res.json();
        return {
            resultCode: data.resultCode || 0,
            login: Number(data.login),
            password: data.password,
            investor: data.investor,
            server: data.server || params.server,
            debugLog: data.debugLog
        };
    }
    async connectEx(user, password, server = 'MetaQuotes-Demo', apiKey = 'TRIAL') {
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
        const data = await res.json();
        return {
            terminalInstanceGuid: data?.data?.terminalInstanceGuid || '',
            terminalType: data?.data?.terminalType || 'MT5'
        };
    }
    async disconnect(terminalId, apiKey = 'TRIAL') {
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
        const data = await res.json();
        return {
            uniqueIdentifier: data?.data?.uniqueIdentifier || '',
            lifetimeSeconds: data?.data?.fullLifeTimeSeconds || 0
        };
    }
    async orderSend(terminalId, symbol, operation, volume, apiKey = 'TRIAL') {
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
        if (!res.ok)
            throw new Error(`OrderSend failed: HTTP ${res.status}`);
        return await res.json();
    }
    async openedOrders(terminalId, apiKey = 'TRIAL') {
        const url = `${this.baseHttpUrl}/OpenedOrders?id=${encodeURIComponent(terminalId)}`;
        const res = await fetch(url, {
            headers: {
                'APIKey': apiKey,
                'id': terminalId,
                'User-Agent': 'NodeCopier/1.0.0'
            }
        });
        if (!res.ok)
            throw new Error(`OpenedOrders failed: HTTP ${res.status}`);
        const data = await res.json();
        return data?.data?.positionInfos || [];
    }
    async orderClose(terminalId, ticket, apiKey = 'TRIAL') {
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
        if (!res.ok)
            throw new Error(`OrderClose failed: HTTP ${res.status}`);
        return await res.json();
    }
}
exports.DemoAccountClient = DemoAccountClient;
function toHyphenGuid(guid) {
    const clean = guid.replace('mt5_live_', '').replace(/-/g, '');
    if (clean.length === 32) {
        return `${clean.substring(0, 8)}-${clean.substring(8, 12)}-${clean.substring(12, 16)}-${clean.substring(16, 20)}-${clean.substring(20, 32)}`;
    }
    return guid;
}
