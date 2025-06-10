import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface SetNewPoolAmplificationIntentionData {
  coinTypeA: string;
  coinTypeB: string;
  adminCapId: string;
  poolId: string;
  newAmplification: string;
}

export class SetNewPoolAmplificationIntention extends BaseIntention<SetNewPoolAmplificationIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.SET_NEW_POOL_AMPLIFICATION;

  constructor(public readonly data: SetNewPoolAmplificationIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.poolEntry,
      function: config.setNewPoolAmplificationMethod,
      typeArguments: [this.data.coinTypeA, this.data.coinTypeB],
      arguments: [
        transaction.object(this.data.adminCapId),
        transaction.object(this.data.poolId),
        transaction.pure.u64(this.data.newAmplification),
      ],
    });

    return transaction;
  }

  static fromData(data: SetNewPoolAmplificationIntentionData) {
    return new SetNewPoolAmplificationIntention(data);
  }
}
