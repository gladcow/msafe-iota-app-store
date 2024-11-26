import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { buildCoinTransferTxb } from './utils';

export interface CoinTransferIntentionData {
  recipient: string;
  coinType: string;
  amount: string;
}

export class CoinTransferIntention extends CoreBaseIntention<CoinTransferIntentionData> {
  txType: TransactionType.Assets;

  txSubType: 'SendCoin';

  constructor(public readonly data: CoinTransferIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;
    return buildCoinTransferTxb(client, this.data, account.address);
  }

  static fromData(data: CoinTransferIntentionData) {
    return new CoinTransferIntention(data);
  }
}
