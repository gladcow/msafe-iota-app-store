import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface WithdrawRewardToTreasuryIntentionData {
  stakeCoinType: string;
  rewardCoinType: string;
  poolId: string;
  amount: string;
  globalConfigId: string;
  clockId: string;
}

export class WithdrawRewardToTreasuryIntention extends BaseIntention<WithdrawRewardToTreasuryIntentionData> {
  txType: TransactionType.Assets;

  txSubType: TransactionSubType.WITHDRAW_REWARD_TO_TREASURY;

  constructor(public readonly data: WithdrawRewardToTreasuryIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.stakeEntry,
      function: config.withdrawRewardToTreasuryMethod,
      typeArguments: [this.data.stakeCoinType, this.data.rewardCoinType],
      arguments: [
        transaction.object(this.data.poolId),
        transaction.pure.u64(this.data.amount),
        transaction.object(this.data.globalConfigId),
        transaction.object(this.data.clockId),
      ],
    });

    return transaction;
  }

  static fromData(data: WithdrawRewardToTreasuryIntentionData) {
    return new WithdrawRewardToTreasuryIntention(data);
  }
}
