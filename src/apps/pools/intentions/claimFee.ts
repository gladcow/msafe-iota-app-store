import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface ClaimFeeIntentionData {
  coinTypeA: string;
  coinTypeB: string;
  adminCapId: string;
  poolId: string;
}

export class ClaimFeeIntention extends BaseIntention<ClaimFeeIntentionData> {
  txType: TransactionType.Assets;

  txSubType: TransactionSubType.CLAIM_FEE;

  constructor(public readonly data: ClaimFeeIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.poolEntry,
      function: config.claimFeeMethod,
      typeArguments: [this.data.coinTypeA, this.data.coinTypeB],
      arguments: [transaction.object(this.data.adminCapId), transaction.object(this.data.poolId)],
    });

    return transaction;
  }

  static fromData(data: ClaimFeeIntentionData) {
    return new ClaimFeeIntention(data);
  }
}
