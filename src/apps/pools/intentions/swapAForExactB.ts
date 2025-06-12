import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface SwapAForExactBIntentionData {
  poolId: string;
  coinTypeA: string;
  coinTypeB: string;
  coinAId: string;
  amountAMax: string;
  amountBOut: string;
  pauseStatusId: string;
}

export class SwapAForExactBIntention extends BaseIntention<SwapAForExactBIntentionData> {
  txType: TransactionType.Assets;

  txSubType: TransactionSubType.SWAP_A_FOR_EXACT_B;

  constructor(public readonly data: SwapAForExactBIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.poolEntry,
      function: config.swapCoinAForExactCoinBMethod,
      typeArguments: [this.data.coinTypeA, this.data.coinTypeB],
      arguments: [
        transaction.object(this.data.poolId),
        transaction.object(this.data.pauseStatusId),
        transaction.object(this.data.coinAId),
        transaction.pure.u64(this.data.amountAMax),
        transaction.pure.u64(this.data.amountBOut),
      ],
    });

    return transaction;
  }

  static fromData(data: SwapAForExactBIntentionData) {
    return new SwapAForExactBIntention(data);
  }
}
