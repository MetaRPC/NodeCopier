"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoAccountClient = void 0;
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
}
exports.DemoAccountClient = DemoAccountClient;
