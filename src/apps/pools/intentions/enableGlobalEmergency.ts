import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface EnableGlobalEmergencyIntentionData {
  globalConfigId: string;
}

export class EnableGlobalEmergencyIntention extends BaseIntention<EnableGlobalEmergencyIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ENABLE_GLOBAL_EMERGENCY;

  constructor(public readonly data: EnableGlobalEmergencyIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.stakeEntry,
      function: config.enableGlobalEmergencyMethod,
      arguments: [transaction.object(this.data.globalConfigId)],
    });

    return transaction;
  }

  static fromData(data: EnableGlobalEmergencyIntentionData) {
    return new EnableGlobalEmergencyIntention(data);
  }
}
