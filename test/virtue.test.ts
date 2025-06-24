import { getFullnodeUrl, IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { IotaSignTransactionInput, WalletAccount } from '@iota/wallet-standard';
import { HexToUint8Array } from '@msafe/iota-utils';
import { COLLATERAL_COIN } from '@virtue/sdk';

import { getVirtueClient } from '@/apps/virtue/api/config';
import { Decoder } from '@/apps/virtue/decoder';
import {
  DepositStabilityPoolIntentionData,
  ManagePositionIntentionData,
  WithdrawStabilityPoolIntentionData,
} from '@/apps/virtue/types/api';
import { IotaNetworks } from '@/types';

import { Logger, ILogObj } from 'tslog';

const logger = new Logger<ILogObj>({
  name: 'Virtue',
});

describe('Virtue App', () => {
  const testWallet: WalletAccount = {
    // make sure wallet address has enough token to simulate the below test scenarios
    address: '0xbb8fb81588760a267589c3d09d664b227981266d40d00666f84595c6068d754b',
    publicKey: HexToUint8Array('76491b011bf1f90d253076e64a4b7e583b85b939b74d8f3a529b1c9d6a1bc72c'),
    chains: ['iota:mainnet'],
    features: [],
  };
  const network: IotaNetworks = 'iota:mainnet';
  const virtueClient = getVirtueClient(network, testWallet);
  const iotaClient = new IotaClient({ url: getFullnodeUrl('testnet') });

  function getDecoder(tx: Transaction) {
    const input = {
      network,
      client: iotaClient,
      account: testWallet,
      transaction: tx,
      chain: network,
    } as IotaSignTransactionInput & {
      network: IotaNetworks;
      client: IotaClient;
      account: WalletAccount;
    };
    return new Decoder(input);
  }

  // --- Position ---
  it('Test open position', async () => {
    const collateralSymbol: COLLATERAL_COIN = 'IOTA';
    const depositAmount = (10 ** 9).toString();
    const borrowAmount = (10 ** 6).toString();
    const repaymentAmount = (0).toString();
    const withdrawAmount = (0).toString();

    const tx = await virtueClient.buildManagePositionTransaction({
      collateralSymbol,
      depositAmount,
      borrowAmount,
      repaymentAmount,
      withdrawAmount,
      accountObjId: undefined,
    });

    const decoder = getDecoder(tx);
    const result = await decoder.decode();

    expect(result.type).toBe('manage-position');
    const intentionData = result.intentionData as ManagePositionIntentionData;
    expect(intentionData.collateralSymbol).toBe('IOTA');
    expect(intentionData.depositAmount).toBe(depositAmount);
    expect(intentionData.borrowAmount).toBe(borrowAmount);
    expect(intentionData.repaymentAmount).toBe(repaymentAmount);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  });

  // it('Test position deposit', async () => {
  //   const collateralSymbol: COLLATERAL_COIN = 'IOTA';
  //   const depositAmount = (10 ** 9).toString();
  //   const borrowAmount = (0).toString();
  //   const repaymentAmount = (0).toString();
  //   const withdrawAmount = (0).toString();
  //
  //   const tx = await virtueClient.buildManagePositionTransaction({
  //     collateralSymbol,
  //     depositAmount,
  //     borrowAmount,
  //     repaymentAmount,
  //     withdrawAmount,
  //     accountObjId: undefined,
  //   });
  //
  //   const decoder = getDecoder(tx);
  //   const result = await decoder.decode();
  //
  //   expect(result.type).toBe('manage-position');
  //   const intentionData = result.intentionData as ManagePositionIntentionData;
  //   expect(intentionData.collateralSymbol).toBe(collateralSymbol);
  //   expect(intentionData.depositAmount).toBe(depositAmount);
  //   expect(intentionData.borrowAmount).toBe(borrowAmount);
  //   expect(intentionData.repaymentAmount).toBe(repaymentAmount);
  //   expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  // });
  //
  // it('Test position borrow', async () => {
  //   const collateralSymbol: COLLATERAL_COIN = 'IOTA';
  //   const depositAmount = (0).toString();
  //   const borrowAmount = (10 ** 6).toString();
  //   const repaymentAmount = (0).toString();
  //   const withdrawAmount = (0).toString();
  //
  //   const tx = await virtueClient.buildManagePositionTransaction({
  //     collateralSymbol,
  //     depositAmount,
  //     borrowAmount,
  //     repaymentAmount,
  //     withdrawAmount,
  //     accountObjId: undefined,
  //   });
  //
  //   const decoder = getDecoder(tx);
  //   const result = await decoder.decode();
  //
  //   expect(result.type).toBe('manage-position');
  //   const intentionData = result.intentionData as ManagePositionIntentionData;
  //   expect(intentionData.collateralSymbol).toBe(collateralSymbol);
  //   expect(intentionData.depositAmount).toBe(depositAmount);
  //   expect(intentionData.borrowAmount).toBe(borrowAmount);
  //   expect(intentionData.repaymentAmount).toBe(repaymentAmount);
  //   expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  // });
  //
  // it('Test position withdraw', async () => {
  //   const collateralSymbol: COLLATERAL_COIN = 'IOTA';
  //   const depositAmount = (0).toString();
  //   const borrowAmount = (0).toString();
  //   const repaymentAmount = (0).toString();
  //   const withdrawAmount = (10 ** 9).toString();
  //
  //   const tx = await virtueClient.buildManagePositionTransaction({
  //     collateralSymbol,
  //     depositAmount,
  //     borrowAmount,
  //     repaymentAmount,
  //     withdrawAmount,
  //     accountObjId: undefined,
  //   });
  //
  //   const decoder = getDecoder(tx);
  //   const result = await decoder.decode();
  //
  //   expect(result.type).toBe('manage-position');
  //   const intentionData = result.intentionData as ManagePositionIntentionData;
  //   expect(intentionData.collateralSymbol).toBe(collateralSymbol);
  //   expect(intentionData.depositAmount).toBe(depositAmount);
  //   expect(intentionData.borrowAmount).toBe(borrowAmount);
  //   expect(intentionData.repaymentAmount).toBe(repaymentAmount);
  //   expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  // });
  //
  // it('Test position repay', async () => {
  //   const collateralSymbol: COLLATERAL_COIN = 'IOTA';
  //   const depositAmount = (0).toString();
  //   const borrowAmount = (0).toString();
  //   const repaymentAmount = (10 ** 9).toString();
  //   const withdrawAmount = (0).toString();
  //
  //   const tx = await virtueClient.buildManagePositionTransaction({
  //     collateralSymbol,
  //     depositAmount,
  //     borrowAmount,
  //     repaymentAmount,
  //     withdrawAmount,
  //     accountObjId: undefined,
  //   });
  //
  //   const decoder = getDecoder(tx);
  //   const result = await decoder.decode();
  //
  //   expect(result.type).toBe('manage-position');
  //   const intentionData = result.intentionData as ManagePositionIntentionData;
  //   expect(intentionData.collateralSymbol).toBe(collateralSymbol);
  //   expect(intentionData.depositAmount).toBe(depositAmount);
  //   expect(intentionData.borrowAmount).toBe(borrowAmount);
  //   expect(intentionData.repaymentAmount).toBe(repaymentAmount);
  //   expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  // });

  // TODO: test borrow and deposit to stability pool

  // TODO: tank test
  // --- Tank ---
  // it('Test deposit stability pool', async () => {
  //   const depositAmount = (10 ** 9).toString();
  //
  //   const tx = await virtueClient.buildDepositStabilityPoolTransaction({
  //     depositAmount,
  //   });
  //
  //   const decoder = getDecoder(tx);
  //   const result = await decoder.decode();
  //
  //   expect(result.type).toBe('deposit-stability-pool');
  //   const intentionData = result.intentionData as DepositStabilityPoolIntentionData;
  //   expect(intentionData.depositAmount).toBe(depositAmount);
  // });
  //
  // it('Test withdraw stability pool', async () => {
  //   const withdrawAmount = (10 ** 6).toString();
  //
  //   const tx = await virtueClient.buildWithdrawStabilityPoolTransaction({ withdrawAmount });
  //
  //   const decoder = getDecoder(tx);
  //   const result = await decoder.decode();
  //
  //   expect(result.type).toBe('withdraw-stability-pool');
  //   const intentionData = result.intentionData as WithdrawStabilityPoolIntentionData;
  //   expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  // });
});
