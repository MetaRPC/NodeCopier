"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopierAccount = void 0;
class CopierAccount {
    endpoint;
    userKey;
    constructor(endpoint, userKey) {
        this.endpoint = endpoint;
        this.userKey = userKey;
    }
    getAuthMetadata() {
        return {
            authorization: `Bearer ${this.userKey}`,
            'x-metarpc-client-sdk': 'NodeCopier/1.0.0'
        };
    }
}
exports.CopierAccount = CopierAccount;
