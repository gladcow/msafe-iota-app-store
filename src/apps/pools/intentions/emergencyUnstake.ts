import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface EmergencyUnstakeIntentionData {
  stakeCoinType: string;
  rewardCoinType: string;
  poolId: string;
  globalConfigId: string;
}

export class EmergencyUnstakeIntention extends BaseIntention<EmergencyUnstakeIntentionData> {
  txType: TransactionType.Assets;

  txSubType: TransactionSubType.EMERGENCY_UNSTAKE;

  constructor(public readonly data: EmergencyUnstakeIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.stakeEntry,
      function: config.emergencyUnstakeMethod,
      typeArguments: [this.data.stakeCoinType, this.data.rewardCoinType],
      arguments: [transaction.object(this.data.poolId), transaction.object(this.data.globalConfigId)],
    });

    return transaction;
  }

  static fromData(data: EmergencyUnstakeIntentionData) {
    return new EmergencyUnstakeIntention(data);
  }
}
