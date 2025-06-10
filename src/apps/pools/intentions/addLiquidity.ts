import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface AddLiquidityIntentionData {
  coinTypeA: string;
  coinTypeB: string;
  amountADesired: string;
  amountBDesired: string;
  amountAMin: string;
  amountBMin: string;
  poolId: string;
}

export class AddLiquidityIntention extends BaseIntention<AddLiquidityIntentionData> {
  txType: TransactionType.Assets;

  txSubType: TransactionSubType.ADD_LIQUIDITY;

  constructor(public readonly data: AddLiquidityIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.poolEntry,
      function: config.addLiquidityMethod,
      typeArguments: [this.data.coinTypeA, this.data.coinTypeB],
      arguments: [
        transaction.object(this.data.poolId),
        transaction.object(config.pauseStatusId),
        transaction.pure.u64(this.data.amountADesired),
        transaction.pure.u64(this.data.amountBDesired),
        transaction.pure.u64(this.data.amountAMin),
        transaction.pure.u64(this.data.amountBMin),
      ],
    });

    return transaction;
  }

  static fromData(data: AddLiquidityIntentionData) {
    return new AddLiquidityIntention(data);
  }
}
