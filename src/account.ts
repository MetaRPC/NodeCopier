export class CopierAccount {
    constructor(
        public readonly endpoint: string,
        public readonly userKey: string,
        public readonly managerKey: string = userKey
    ) {}

    getAuthMetadata(): Record<string, string> {
        return {
            authorization: `Bearer ${this.userKey}`,
            'x-metarpc-manager': this.managerKey,
            'x-metarpc-client-sdk': 'NodeCopier/1.0.0'
        };
    }
}
