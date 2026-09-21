"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopierService = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const path = __importStar(require("path"));
const ws_1 = __importDefault(require("ws"));
const account_1 = require("./account");
class CopierService {
    account;
    endpoint;
    grpcClient;
    constructor(endpoint = 'copy.mrpc.pro:443', options) {
        this.endpoint = endpoint;
        this.account = new account_1.CopierAccount(endpoint, options.userKey, options.managerKey);
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
        const descriptor = grpc.loadPackageDefinition(pkgDef);
        this.grpcClient = new descriptor.copier.CopierService(cleanEndpoint, credentials);
    }
    getMetadata() {
        const meta = new grpc.Metadata();
        meta.set('authorization', `Bearer ${this.account.userKey}`);
        if (this.account.managerKey) {
            meta.set('x-metarpc-manager', this.account.managerKey);
        }
        meta.set('x-metarpc-client-sdk', 'NodeCopier/1.0.0');
        return meta;
    }
    async start(req) {
        const request = {
            userKey: req.userKey || this.account.userKey,
            managerKey: req.managerKey || this.account.managerKey,
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
        return new Promise((resolve) => {
            const meta = this.getMetadata();
            const deadline = new Date(Date.now() + 15000);
            this.grpcClient.start(request, meta, { deadline }, (err, response) => {
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
    async list(userKey) {
        const request = {
            userKey: userKey || this.account.userKey
        };
        return new Promise((resolve) => {
            const meta = this.getMetadata();
            const deadline = new Date(Date.now() + 10000);
            this.grpcClient.list(request, meta, { deadline }, (err, response) => {
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
    async pause(copierId, paused) {
        const request = {
            userKey: this.account.userKey,
            copierId,
            paused
        };
        return new Promise((resolve) => {
            const meta = this.getMetadata();
            const deadline = new Date(Date.now() + 10000);
            this.grpcClient.pause(request, meta, { deadline }, (err, response) => {
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
    async remove(copierId) {
        const request = {
            userKey: this.account.userKey,
            copierId
        };
        return new Promise((resolve) => {
            const meta = this.getMetadata();
            const deadline = new Date(Date.now() + 10000);
            this.grpcClient.remove(request, meta, { deadline }, (err, response) => {
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
    streamTradeLogs(copierId, onMessage, onError) {
        const cleanEndpoint = this.endpoint.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
        const isSecure = cleanEndpoint.includes(':443') || cleanEndpoint.endsWith('443') || !cleanEndpoint.includes(':');
        const proto = isSecure ? 'wss' : 'ws';
        const url = `${proto}://${cleanEndpoint}/OnTradeLog?id=${encodeURIComponent(copierId)}`;
        const ws = new ws_1.default(url, {
            headers: this.account.getAuthMetadata()
        });
        ws.on('message', (data) => {
            try {
                const text = data.toString();
                const log = JSON.parse(text);
                onMessage(log);
            }
            catch (e) {
                if (onError)
                    onError(e);
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
                }
                catch { }
            }
        };
    }
    close() {
        try {
            if (this.grpcClient) {
                this.grpcClient.close();
            }
        }
        catch { }
    }
}
exports.CopierService = CopierService;
