import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface RemoveLiquidityIntentionData {
  coinTypeA: string;
  coinTypeB: string;
  coinLpId: string;
  amountLp: string;
  amountAMin: string;
  amountBMin: string;
  poolId: string;
  pauseStatusId: string;
}

export class RemoveLiquidityIntention extends BaseIntention<RemoveLiquidityIntentionData> {
  txType: TransactionType.Assets;

  txSubType: TransactionSubType.REMOVE_LIQUIDITY;

  constructor(public readonly data: RemoveLiquidityIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.poolEntry,
      function: config.removeLiquidityMethod,
      typeArguments: [this.data.coinTypeA, this.data.coinTypeB],
      arguments: [
        transaction.object(this.data.poolId),
        transaction.object(this.data.pauseStatusId),
        transaction.object(this.data.coinLpId),
        transaction.pure.u64(this.data.amountLp),
        transaction.pure.u64(this.data.amountAMin),
        transaction.pure.u64(this.data.amountBMin),
      ],
    });

    return transaction;
  }

  static fromData(data: RemoveLiquidityIntentionData) {
    return new RemoveLiquidityIntention(data);
  }
}
