export interface OpenDemoAccountParams {
    company?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    server: string;
    accountType?: string;
    timeoutSeconds?: number;
}
export interface DemoAccountResult {
    resultCode: number;
    login: number;
    password: string;
    investor: string;
    server: string;
    debugLog?: string;
}
export declare class DemoAccountClient {
    private endpoint;
    private client?;
    constructor(endpoint?: string);
    openDemoAccount(params: OpenDemoAccountParams): Promise<DemoAccountResult>;
}
