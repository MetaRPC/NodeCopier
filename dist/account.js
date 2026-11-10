"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopierAccount = void 0;
class CopierAccount {
    endpoint;
    userKey;
    constructor(endpoint, userKey) {
        this.endpoint = endpoint;
        this.userKey = userKey;
        if (!userKey || !/^[\x21-\x7e]+$/.test(userKey) || userKey.toUpperCase() === 'TRIAL') {
            throw new Error('A real owner API key is required (printable ASCII, no whitespace).');
        }
    }
    getAuthMetadata() {
        return {
            apikey: this.userKey,
            'x-metarpc-client-sdk': 'NodeCopier/1.0.0'
        };
    }
}
exports.CopierAccount = CopierAccount;
