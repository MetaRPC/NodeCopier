import { Account, AccountType, StartRequest, TradeLog } from '../dist';

const routes: AccountType[] = ['CT', 'TL', 'MT4', 'MT5', 'MT4_MTAPI', 'MT5_MTAPI', 'MT4_MRPC', 'MT5_MRPC'];
const account = (type: AccountType): Account => ({ type, user: '123', password: '', server: 'demo', id: 'session' });
const request: StartRequest = { master: account('CT'), slave: account('TL'), riskType: 'FixedLot', riskValue: '0.01' };
// Unsupported platforms must remain a compile-time error.
// @ts-expect-error unsupported provider
const invalid: AccountType = 'UNKNOWN';
void routes; void request; void invalid;

// Broker events contain nested orders; flat convenience fields are not guaranteed.
const event: TradeLog = { id:'event', copierId:'copier', updateType:'Open', success:true,
    masterOrder:{ticket:'432345564230835570',symbol:'EURUSD',lots:0.01},
    slaveOrder:null, slaveTicket:'9007199254740993' };
const exactTicket: number | string | undefined = event.masterOrder?.ticket;
void exactTicket;
