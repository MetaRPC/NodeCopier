export declare class CopierAccount {
    readonly endpoint: string;
    readonly userKey: string;
    constructor(endpoint: string, userKey: string);
    getAuthMetadata(): Record<string, string>;
}
