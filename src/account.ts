export class CopierAccount {
    constructor(
        public readonly endpoint: string,
        public readonly userKey: string
    ) {}

    getAuthMetadata(): Record<string, string> {
        return {
            authorization: `Bearer ${this.userKey}`,
            'x-metarpc-client-sdk': 'NodeCopier/1.0.0'
        };
    }
}
