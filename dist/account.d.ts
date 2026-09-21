export declare class CopierAccount {
    readonly endpoint: string;
    readonly userKey: string;
    readonly managerKey: string;
    constructor(endpoint: string, userKey: string, managerKey?: string);
    getAuthMetadata(): Record<string, string>;
}
