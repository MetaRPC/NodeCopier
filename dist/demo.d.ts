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
export interface ConnectExResult {
    terminalInstanceGuid: string;
    terminalType: string;
}
export interface DisconnectResult {
    uniqueIdentifier: string;
    lifetimeSeconds: number;
}
export declare class DemoAccountClient {
    private baseHttpUrl;
    constructor(endpoint?: string);
    openDemoAccount(params: OpenDemoAccountParams, apiKey?: string): Promise<DemoAccountResult>;
    connectEx(user: number, password: string, server?: string, apiKey?: string): Promise<ConnectExResult>;
    disconnect(terminalId: string, apiKey?: string): Promise<DisconnectResult>;
}
