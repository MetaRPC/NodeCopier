export interface Account {
    type: 'MT4' | 'MT5';
    user: number | string;
    password: string;
    server: string;
    name?: string;
    id?: string;
}

export interface StartRequest {
    userKey?: string;
    managerKey?: string;
    master: Account;
    slave: Account;
    riskType: 'FixedLot' | 'LotMultiplier' | 'BalanceMultiplier' | 'FixedBalanceMultiplier' | 'EquityMultiplier';
    riskValue: string;
    fixedMasterBalance?: string;
    copySl?: boolean;
    copyTp?: boolean;
    copyPendingOrders?: boolean;
    reverseCopy?: boolean;
}

export interface StartReply {
    ok: boolean;
    copierId: string;
    error?: string;
}

export interface CopierSummary {
    id: string;
    masterType: string;
    masterUser: number | string;
    masterServer: string;
    slaveType: string;
    slaveUser: number | string;
    slaveServer: string;
    riskType: string;
    riskValue: string;
    paused: boolean;
    pauseReason?: string;
}

export interface ListReply {
    ok: boolean;
    copiers: CopierSummary[];
    error?: string;
}

export interface SimpleReply {
    ok: boolean;
    error?: string;
}

export interface TradeLog {
    id: string;
    copierId: string;
    symbol: string;
    updateType: string;
    masterTicket: number | string;
    slaveTicket: number | string;
    profit: number;
    success: boolean;
}
