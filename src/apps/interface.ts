import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { IotaSignTransactionInput, WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';
import sortKeys from 'sort-keys-recursive';

import { IotaNetworks } from '@/types';

export interface MSafeAppHelper<T> {
  application: string;
  deserialize(
    input: IotaSignTransactionInput & {
      network: IotaNetworks;
      client: IotaClient;
      account: WalletAccount;
    },
  ): Promise<{
    txType: TransactionType;
    txSubType: string;
    intentionData: T;
  }>;
  build(input: {
    network: string;
    txType: TransactionType;
    txSubType: string;
    intentionData: T;
    client: IotaClient;
    account: WalletAccount;
  }): Promise<Transaction>;
}

export interface TransactionIntention<D> {
  txType: TransactionType;
  txSubType: string;
  data: D;
  serialize(): string;
}

export abstract class BaseIntention<D> implements TransactionIntention<D> {
  abstract txType: TransactionType;

  abstract txSubType: string;

  protected constructor(public readonly data: D) {}

  abstract build(input: {
    network: IotaNetworks;
    txType: TransactionType;
    txSubType: string;
    client: IotaClient;
    account: WalletAccount;
  }): Promise<Transaction>;

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }
}
