import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface SwapExactAForBIntentionData {
  poolId: string;
  coinTypeA: string;
  coinTypeB: string;
  coinAId: string;
  amountAIn: string;
  amountBOutMin: string;
  pauseStatusId: string;
}

export class SwapExactAForBIntention extends BaseIntention<SwapExactAForBIntentionData> {
  txType: TransactionType.Assets;

  txSubType: TransactionSubType.SWAP_EXACT_A_FOR_B;

  constructor(public readonly data: SwapExactAForBIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.poolEntry,
      function: config.swapExactCoinAForCoinBMethod,
      typeArguments: [this.data.coinTypeA, this.data.coinTypeB],
      arguments: [
        transaction.object(this.data.poolId),
        transaction.object(this.data.pauseStatusId),
        transaction.object(this.data.coinAId),
        transaction.pure.u64(this.data.amountAIn),
        transaction.pure.u64(this.data.amountBOutMin),
      ],
    });

    return transaction;
  }

  static fromData(data: SwapExactAForBIntentionData) {
    return new SwapExactAForBIntention(data);
  }
}
