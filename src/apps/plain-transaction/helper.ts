import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { fromHEX, toHEX } from '@iota/iota-sdk/utils';
import { IotaSignTransactionInput, WalletAccount } from '@iota/wallet-standard';
import { TransactionSubTypes, TransactionType } from '@msafe/iota-utils';
import sortKeys from 'sort-keys-recursive';

import { MSafeAppHelper, TransactionIntention } from '@/apps/interface';
import { IotaNetworks } from '@/types';

export type PlainTransactionData = {
  content: string;
};

export const PlainTransactionApplication = 'msafe-plain-tx';
export const PlainTransactionType = TransactionSubTypes.others.plain;

export class PlainTransactionIntention implements TransactionIntention<PlainTransactionData> {
  application = PlainTransactionApplication;

  txType = TransactionType.Other;

  txSubType = PlainTransactionType;

  protected constructor(public readonly data: PlainTransactionData) {}

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }
}
export class PlainTransactionHelper implements MSafeAppHelper<PlainTransactionData> {
  application: string;

  constructor() {
    this.application = PlainTransactionApplication;
  }

  async deserialize(
    input: IotaSignTransactionInput & { network: IotaNetworks; client: IotaClient; account: WalletAccount },
  ): Promise<{ txType: TransactionType; txSubType: string; intentionData: PlainTransactionData }> {
    const { transaction, client } = input;

    const content = await transaction.toJSON();
    const tx = Transaction.from(content);
    const txContent = await tx.build({ client });

    return {
      txType: TransactionType.Other,
      txSubType: PlainTransactionType,
      intentionData: { content: toHEX(txContent) },
    };
  }

  async build(input: {
    network: IotaNetworks;
    txType: TransactionType;
    txSubType: string;
    intentionData: PlainTransactionData;
    client: IotaClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { client, account } = input;
    const txb = Transaction.from(fromHEX(input.intentionData.content));

    const inspectResult = await client.devInspectTransactionBlock({
      transactionBlock: txb,
      sender: account.address,
    });
    const success = inspectResult.effects.status.status === 'success';
    if (!success) {
      throw new Error(inspectResult.effects.status.error);
    }

    return txb;
  }
}
