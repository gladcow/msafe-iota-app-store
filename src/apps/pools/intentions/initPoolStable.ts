import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface InitPoolStableIntentionData {
  coinTypeA: string;
  coinTypeB: string;
  globalCreatedPoolsId: string;
  amplificationP: string; // amplification parameter for stable pools
}

export class InitPoolStableIntention extends BaseIntention<InitPoolStableIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.INIT_POOL_STABLE;

  constructor(public readonly data: InitPoolStableIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.poolEntry,
      function: config.initPoolStableMethod,
      typeArguments: [this.data.coinTypeA, this.data.coinTypeB],
      arguments: [transaction.object(this.data.globalCreatedPoolsId), transaction.pure.u64(this.data.amplificationP)],
    });

    return transaction;
  }

  static fromData(data: InitPoolStableIntentionData) {
    return new InitPoolStableIntention(data);
  }
}
