export type AccountType = 'MT4' | 'MT5' | 'MT4_MTAPI' | 'MT5_MTAPI' | 'MT4_MRPC' | 'MT5_MRPC' | 'CT' | 'TL';

export interface Account {
    type: AccountType;
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

export interface TradeLogOrder {
    ticket?: number | string;
    symbol?: string;
    lots?: number | string;
    type?: number | string;
    [field: string]: unknown;
}

export interface TradeLog {
    id: string;
    copierId: string;
    symbol?: string;
    updateType: string;
    masterTicket?: number | string;
    slaveTicket?: number | string;
    masterOrder?: TradeLogOrder | null;
    slaveOrder?: TradeLogOrder | null;
    slaveSymbol?: string;
    profit?: number | string;
    success: boolean;
    exceptionCode?: string | null;
    exceptionMessage?: string | null;
    [field: string]: unknown;
}
