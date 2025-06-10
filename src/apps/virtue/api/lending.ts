import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { buildManagePositionTx, COLLATERAL_COIN } from '@virtue/sdk';

import { IotaNetworks } from '@/types';

import { getVirtueClient } from './config';
import { ManagePositionIntentionData } from '../types/api';

export const getManagePositionTx = async (
  txbParams: ManagePositionIntentionData,
  account: WalletAccount,
  network: IotaNetworks,
): Promise<Transaction> => {
  const { collateralType, collateralAmount, borrowAmount, repaymentAmount, withdrawAmount } = txbParams;

  const tx = new Transaction();
  const virtueClient = getVirtueClient(network, account);
  await buildManagePositionTx(
    virtueClient,
    tx as any,
    account.address,
    collateralType as COLLATERAL_COIN,
    collateralAmount,
    borrowAmount,
    repaymentAmount,
    withdrawAmount,
  );

  return tx;
};
