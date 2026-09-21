"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopierAccount = void 0;
class CopierAccount {
    endpoint;
    userKey;
    managerKey;
    constructor(endpoint, userKey, managerKey = userKey) {
        this.endpoint = endpoint;
        this.userKey = userKey;
        this.managerKey = managerKey;
    }
    getAuthMetadata() {
        return {
            authorization: `Bearer ${this.userKey}`,
            'x-metarpc-manager': this.managerKey,
            'x-metarpc-client-sdk': 'NodeCopier/1.0.0'
        };
    }
}
exports.CopierAccount = CopierAccount;
