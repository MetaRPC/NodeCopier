export class CopierAccount {
    constructor(
        public readonly endpoint: string,
        public readonly userKey: string
     ) {
        if (!userKey || !/^[\x21-\x7e]+$/.test(userKey) || userKey.toUpperCase() === 'TRIAL') {
            throw new Error('A real owner API key is required (printable ASCII, no whitespace).');
        }
    }

    getAuthMetadata(): Record<string, string> {
        return {
            apikey: this.userKey,
            'x-metarpc-client-sdk': 'NodeCopier/1.0.0'
        };
    }
}
