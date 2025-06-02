import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface RegisterPoolIntentionData {
  stakeCoinType: string;
  rewardCoinType: string;
  rewardsCoinId: string;
  duration: string;
  decimalS: number;
  decimalR: number;
  durationUnstakeTimeMs: string;
  maxStakeValue: string;
  globalConfigId: string;
  clockId: string;
}

export class RegisterPoolIntention extends BaseIntention<RegisterPoolIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.REGISTER_POOL;

  constructor(public readonly data: RegisterPoolIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.stakeEntry,
      function: config.registerPoolMethod,
      typeArguments: [this.data.stakeCoinType, this.data.rewardCoinType],
      arguments: [
        transaction.object(this.data.rewardsCoinId),
        transaction.pure.u64(this.data.duration),
        transaction.object(this.data.globalConfigId),
        transaction.pure.u8(this.data.decimalS),
        transaction.pure.u8(this.data.decimalR),
        transaction.object(this.data.clockId),
        transaction.pure.u64(this.data.durationUnstakeTimeMs),
        transaction.pure.u64(this.data.maxStakeValue),
      ],
    });

    return transaction;
  }

  static fromData(data: RegisterPoolIntentionData) {
    return new RegisterPoolIntention(data);
  }
}
