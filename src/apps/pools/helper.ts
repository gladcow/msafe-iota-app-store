import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { IotaSignTransactionInput, WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { MSafeAppHelper } from '@/apps/interface';
import { IotaNetworks } from '@/types';

import { Decoder } from './decoder';
import { AddLiquidityIntention, AddLiquidityIntentionData } from './intentions/addLiquidity';
import { RemoveLiquidityIntention, RemoveLiquidityIntentionData } from './intentions/removeLiquidity';
import { TransactionSubType } from './types';

export type PoolsIntention = AddLiquidityIntention | RemoveLiquidityIntention;

export type PoolsIntentionData = AddLiquidityIntentionData | RemoveLiquidityIntentionData;

export class PoolsAppHelper implements MSafeAppHelper<PoolsIntentionData> {
  application = 'pools';

  async deserialize(
    input: IotaSignTransactionInput & {
      network: IotaNetworks;
      client: IotaClient;
      account: WalletAccount;
    },
  ): Promise<{ txType: TransactionType; txSubType: string; intentionData: PoolsIntentionData }> {
    const decoder = new Decoder(input);
    const result = await decoder.decode();

    return {
      txType: result.txType,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    network: string;
    txType: TransactionType;
    txSubType: string;
    intentionData: PoolsIntentionData;
    client: IotaClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { client, account, txSubType, intentionData } = input;

    let intention: PoolsIntention;

    switch (txSubType) {
      case TransactionSubType.ADD_LIQUIDITY:
        intention = AddLiquidityIntention.fromData(intentionData as AddLiquidityIntentionData);
        break;
      case TransactionSubType.REMOVE_LIQUIDITY:
        intention = RemoveLiquidityIntention.fromData(intentionData as RemoveLiquidityIntentionData);
        break;
      default:
        throw new Error(`Unsupported transaction subtype: ${txSubType}`);
    }

    return intention.build({ client, account });
  }
}
