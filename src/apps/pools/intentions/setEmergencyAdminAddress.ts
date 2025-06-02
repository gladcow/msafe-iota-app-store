import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { BaseIntention } from '@/apps/interface';

import config from '../config';
import { TransactionSubType } from '../types';

export interface SetEmergencyAdminAddressIntentionData {
  globalConfigId: string;
  newAddress: string;
}

export class SetEmergencyAdminAddressIntention extends BaseIntention<SetEmergencyAdminAddressIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.SET_EMERGENCY_ADMIN_ADDRESS;

  constructor(public readonly data: SetEmergencyAdminAddressIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<Transaction> {
    const { client, account } = input;

    const transaction = new Transaction();

    transaction.setSender(account.address);

    transaction.moveCall({
      package: config.moduleId,
      module: config.stakeEntry,
      function: config.setEmergencyAdminAddressMethod,
      arguments: [transaction.object(this.data.globalConfigId), transaction.pure.address(this.data.newAddress)],
    });

    return transaction;
  }

  static fromData(data: SetEmergencyAdminAddressIntentionData) {
    return new SetEmergencyAdminAddressIntention(data);
  }
}
