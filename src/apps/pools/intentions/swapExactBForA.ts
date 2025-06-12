import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface SwapExactBForAIntentionData {
  poolId: string;
  coinTypeA: string;
  coinTypeB: string;
  coinBId: string;
  amountBIn: string;
  amountAOutMin: string;
  pauseStatusId: string;
}

export class SwapExactBForAIntention extends BaseIntention<SwapExactBForAIntentionData> {
  txType: TransactionType.Assets;

  txSubType: TransactionSubType.SWAP_EXACT_B_FOR_A;

  constructor(public readonly data: SwapExactBForAIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.poolEntry,
      function: config.swapExactCoinBForCoinAMethod,
      typeArguments: [this.data.coinTypeA, this.data.coinTypeB],
      arguments: [
        transaction.object(this.data.poolId),
        transaction.object(this.data.pauseStatusId),
        transaction.object(this.data.coinBId),
        transaction.pure.u64(this.data.amountBIn),
        transaction.pure.u64(this.data.amountAOutMin),
      ],
    });

    return transaction;
  }

  static fromData(data: SwapExactBForAIntentionData) {
    return new SwapExactBForAIntention(data);
  }
}
