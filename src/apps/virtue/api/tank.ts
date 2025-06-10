import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { buildDepositStabilityPoolTx } from '@virtue/sdk';

import { IotaNetworks } from '@/types';

import { getVirtueClient } from './config';
import { DepositStabilityPoolIntentionData } from '../types/api';

export const getDepositStabilityPoolTx = async (
  txbParams: DepositStabilityPoolIntentionData,
  account: WalletAccount,
  network: IotaNetworks,
): Promise<Transaction> => {
  const { vusdAmount, recipient } = txbParams;

  const tx = new Transaction();
  const virtueClient = getVirtueClient(network, account);
  await buildDepositStabilityPoolTx(virtueClient, tx as any, account.address, vusdAmount, recipient);

  return tx;
};
