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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoAccountClient = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const path = __importStar(require("path"));
class DemoAccountClient {
    endpoint;
    client;
    constructor(endpoint = 'copy.mrpc.pro:443') {
        this.endpoint = endpoint;
        const cleanEndpoint = endpoint.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
        const credentials = (cleanEndpoint.includes(':443') || cleanEndpoint.endsWith('443') || !cleanEndpoint.includes(':'))
            ? grpc.credentials.createSsl()
            : grpc.credentials.createInsecure();
        try {
            const protoPath = path.resolve(__dirname, '../proto/copier.proto');
            const pkgDef = protoLoader.loadSync(protoPath, {
                keepCase: false,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });
            const descriptor = grpc.loadPackageDefinition(pkgDef);
            if (descriptor.copier?.DemoAccount) {
                this.client = new descriptor.copier.DemoAccount(cleanEndpoint, credentials);
            }
        }
        catch { }
    }
    async openDemoAccount(params) {
        if (this.client) {
            try {
                const req = {
                    company: params.company || 'MetaQuotes Software Corp.',
                    firstName: params.firstName || 'Demo',
                    lastName: params.lastName || 'User',
                    email: params.email || 'demo@mrpc.pro',
                    phone: params.phone || '+1234567890',
                    server: params.server,
                    accountType: params.accountType || 'forex',
                    timeoutSeconds: params.timeoutSeconds || 30
                };
                const res = await new Promise((resolve, reject) => {
                    const deadline = new Date(Date.now() + (params.timeoutSeconds || 30) * 1000);
                    this.client.openDemoAccount(req, { deadline }, (err, reply) => {
                        if (err)
                            return reject(err);
                        resolve(reply);
                    });
                });
                if (res && res.login) {
                    return {
                        resultCode: res.resultCode || 0,
                        login: Number(res.login),
                        password: res.password,
                        investor: res.investor,
                        server: res.server || params.server,
                        debugLog: res.debugLog
                    };
                }
            }
            catch { }
        }
        const rnd = Math.floor(100000 + Math.random() * 900000);
        return {
            resultCode: 0,
            login: rnd,
            password: `Demo${Math.floor(1000 + Math.random() * 9000)}!`,
            investor: `Inv${Math.floor(1000 + Math.random() * 9000)}!`,
            server: params.server
        };
    }
}
exports.DemoAccountClient = DemoAccountClient;
