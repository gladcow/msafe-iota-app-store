import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface InitPoolClassicIntentionData {
  coinTypeA: string;
  coinTypeB: string;
  globalCreatedPoolsId: string;
}

export class InitPoolClassicIntention extends BaseIntention<InitPoolClassicIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.INIT_POOL_CLASSIC;

  constructor(public readonly data: InitPoolClassicIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.poolEntry,
      function: config.initPoolClassicMethod,
      typeArguments: [this.data.coinTypeA, this.data.coinTypeB],
      arguments: [transaction.object(this.data.globalCreatedPoolsId)],
    });

    return transaction;
  }

  static fromData(data: InitPoolClassicIntentionData) {
    return new InitPoolClassicIntention(data);
  }
}
