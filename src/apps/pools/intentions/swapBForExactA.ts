import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface SwapBForExactAIntentionData {
  poolId: string;
  coinTypeA: string;
  coinTypeB: string;
  coinBId: string;
  amountBMax: string;
  amountAOut: string;
  pauseStatusId: string;
}

export class SwapBForExactAIntention extends BaseIntention<SwapBForExactAIntentionData> {
  txType: TransactionType.Assets;

  txSubType: TransactionSubType.SWAP_B_FOR_EXACT_A;

  constructor(public readonly data: SwapBForExactAIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.poolEntry,
      function: config.swapCoinBForExactCoinAMethod,
      typeArguments: [this.data.coinTypeA, this.data.coinTypeB],
      arguments: [
        transaction.object(this.data.poolId),
        transaction.object(this.data.pauseStatusId),
        transaction.object(this.data.coinBId),
        transaction.pure.u64(this.data.amountBMax),
        transaction.pure.u64(this.data.amountAOut),
      ],
    });

    return transaction;
  }

  static fromData(data: SwapBForExactAIntentionData) {
    return new SwapBForExactAIntention(data);
  }
}
