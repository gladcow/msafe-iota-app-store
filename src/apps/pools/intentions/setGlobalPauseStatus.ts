import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface SetGlobalPauseStatusIntentionData {
  adminCapId: string;
  globalPauseStatusId: string;
  status: boolean;
}

export class SetGlobalPauseStatusIntention extends BaseIntention<SetGlobalPauseStatusIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.SET_GLOBAL_PAUSE_STATUS;

  constructor(public readonly data: SetGlobalPauseStatusIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.poolEntry,
      function: config.setGlobalPauseStatusMethod,
      arguments: [
        transaction.object(this.data.adminCapId),
        transaction.object(this.data.globalPauseStatusId),
        transaction.pure.bool(this.data.status),
      ],
    });

    return transaction;
  }

  static fromData(data: SetGlobalPauseStatusIntentionData) {
    return new SetGlobalPauseStatusIntention(data);
  }
}
