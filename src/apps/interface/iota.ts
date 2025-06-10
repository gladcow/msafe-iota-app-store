import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { IdentifierString, WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';
import sortKeys from 'sort-keys-recursive';

import { IotaNetworks } from '@/types';

export interface IAppHelperInternal<T> {
  application: string;
  supportSDK: '@iota/iota-sdk';

  deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: IotaNetworks;
    iotaClient: IotaClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{
    txType: TransactionType;
    txSubType: string;
    intentionData: T;
  }>;

  build(input: {
    network: IotaNetworks;
    txType: TransactionType;
    txSubType: string;
    intentionData: T;
    iotaClient: IotaClient;
    account: WalletAccount;
  }): Promise<Transaction>;
}

export interface TransactionIntention<D> {
  txType: TransactionType;
  txSubType: string;
  data: D;

  serialize(): string;

  build(input: { iotaClient: IotaClient; account: WalletAccount; network: IotaNetworks }): Promise<Transaction>;
}

export abstract class BaseIntention<D> implements TransactionIntention<D> {
  abstract txType: TransactionType;

  abstract txSubType: string;

  protected constructor(public readonly data: D) {}

  abstract build(input: {
    network: IotaNetworks;
    iotaClient: IotaClient;
    account: WalletAccount;
  }): Promise<Transaction>;

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }
}
