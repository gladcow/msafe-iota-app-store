import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';
import { DepositStabilityPoolIntentionData } from '@/apps/virtue/types/api';
import { IotaNetworks } from '@/types';

import { getDepositStabilityPoolTx } from '../api/tank';
import { TransactionSubType } from '../types';

export class DepositStabilityPoolIntention extends BaseIntention<DepositStabilityPoolIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.DepositStabilityPool;

  constructor(public readonly data: DepositStabilityPoolIntentionData) {
    super(data);
  }

  async build(input: {
    network: IotaNetworks;
    txType: TransactionType;
    txSubType: string;
    client: IotaClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getDepositStabilityPoolTx(this.data, account, network);
    return tx;
  }

  static fromData(data: DepositStabilityPoolIntentionData) {
    return new DepositStabilityPoolIntention(data);
  }
}
