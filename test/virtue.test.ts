import { getFullnodeUrl, IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { normalizeIotaAddress } from '@iota/iota-sdk/utils';
import { IotaSignTransactionInput, WalletAccount } from '@iota/wallet-standard';
import { HexToUint8Array } from '@msafe/iota-utils';
import {
  buildManagePositionTx,
  buildDepositStabilityPoolTx,
  buildWithdrawStabilityPoolTx,
  COINS_TYPE_LIST,
} from '@virtue/sdk';

import { getVirtueClient } from '@/apps/virtue/api/config';
import { Decoder } from '@/apps/virtue/decoder';
import {
  DepositStabilityPoolIntentionData,
  ManagePositionIntentionData,
  WithdrawStabilityPoolIntentionData,
} from '@/apps/virtue/types/api';
import { IotaNetworks } from '@/types';

describe('Bucket App', () => {
  const testWallet: WalletAccount = {
    // make sure wallet address has enough token to simulate the below test scenarios
    address: '0xbb8fb81588760a267589c3d09d664b227981266d40d00666f84595c6068d754b',
    publicKey: HexToUint8Array('76491b011bf1f90d253076e64a4b7e583b85b939b74d8f3a529b1c9d6a1bc72c'),
    chains: ['iota:mainnet'],
    features: [],
  };
  const network: IotaNetworks = 'iota:testnet';
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
    const tx = new Transaction();

    const collateralAmount = (10 ** 9).toString();
    const borrowAmount = (10 ** 6).toString();
    const repaymentAmount = (0).toString();
    const withdrawAmount = (0).toString();
    await buildManagePositionTx(
      virtueClient,
      tx as any,
      testWallet.address,
      'IOTA',
      // collateralAmount
      collateralAmount,
      // borrowAmount
      borrowAmount,
      // repaymentAmount
      repaymentAmount,
      // withdrawAmount
      withdrawAmount,
    );

    const decoder = getDecoder(tx);
    const result = await decoder.decode();

    expect(result.type).toBe('manage-position');
    const intentionData = result.intentionData as ManagePositionIntentionData;
    expect(intentionData.collateralType).toBe(COINS_TYPE_LIST.IOTA);
    expect(intentionData.collateralAmount).toBe(collateralAmount);
    expect(intentionData.borrowAmount).toBe(borrowAmount);
    expect(intentionData.repaymentAmount).toBe(repaymentAmount);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  });

  it('Test position deposit', async () => {
    const tx = new Transaction();

    const collateralAmount = (10 ** 9).toString();
    const borrowAmount = (0).toString();
    const repaymentAmount = (0).toString();
    const withdrawAmount = (0).toString();
    await buildManagePositionTx(
      virtueClient,
      tx as any,
      testWallet.address,
      'IOTA',
      // collateralAmount
      collateralAmount,
      // borrowAmount
      borrowAmount,
      // repaymentAmount
      repaymentAmount,
      // withdrawAmount
      withdrawAmount,
    );

    const decoder = getDecoder(tx);
    const result = await decoder.decode();

    expect(result.type).toBe('manage-position');
    const intentionData = result.intentionData as ManagePositionIntentionData;
    expect(intentionData.collateralType).toBe(COINS_TYPE_LIST.IOTA);
    expect(intentionData.collateralAmount).toBe(collateralAmount);
    expect(intentionData.borrowAmount).toBe(borrowAmount);
    expect(intentionData.repaymentAmount).toBe(repaymentAmount);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  });

  it('Test position borrow', async () => {
    const tx = new Transaction();

    const collateralAmount = (0).toString();
    const borrowAmount = (10 ** 6).toString();
    const repaymentAmount = (0).toString();
    const withdrawAmount = (0).toString();
    await buildManagePositionTx(
      virtueClient,
      tx as any,
      testWallet.address,
      'IOTA',
      // collateralAmount
      collateralAmount,
      // borrowAmount
      borrowAmount,
      // repaymentAmount
      repaymentAmount,
      // withdrawAmount
      withdrawAmount,
    );

    const decoder = getDecoder(tx);
    const result = await decoder.decode();

    expect(result.type).toBe('manage-position');
    const intentionData = result.intentionData as ManagePositionIntentionData;
    expect(intentionData.collateralType).toBe(COINS_TYPE_LIST.IOTA);
    expect(intentionData.collateralAmount).toBe(collateralAmount);
    expect(intentionData.borrowAmount).toBe(borrowAmount);
    expect(intentionData.repaymentAmount).toBe(repaymentAmount);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  });

  it('Test position withdraw', async () => {
    const tx = new Transaction();

    const collateralAmount = (0).toString();
    const borrowAmount = (0).toString();
    const repaymentAmount = (0).toString();
    const withdrawAmount = (10 ** 9).toString();
    await buildManagePositionTx(
      virtueClient,
      tx as any,
      testWallet.address,
      'IOTA',
      // collateralAmount
      collateralAmount,
      // borrowAmount
      borrowAmount,
      // repaymentAmount
      repaymentAmount,
      // withdrawAmount
      withdrawAmount,
    );

    const decoder = getDecoder(tx);
    const result = await decoder.decode();

    expect(result.type).toBe('manage-position');
    const intentionData = result.intentionData as ManagePositionIntentionData;
    expect(intentionData.collateralType).toBe(COINS_TYPE_LIST.IOTA);
    expect(intentionData.collateralAmount).toBe(collateralAmount);
    expect(intentionData.borrowAmount).toBe(borrowAmount);
    expect(intentionData.repaymentAmount).toBe(repaymentAmount);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  });

  it('Test position repay', async () => {
    const tx = new Transaction();

    const collateralAmount = (0).toString();
    const borrowAmount = (0).toString();
    const repaymentAmount = (10 ** 9).toString();
    const withdrawAmount = (0).toString();
    await buildManagePositionTx(
      virtueClient,
      tx as any,
      testWallet.address,
      'IOTA',
      // collateralAmount
      collateralAmount,
      // borrowAmount
      borrowAmount,
      // repaymentAmount
      repaymentAmount,
      // withdrawAmount
      withdrawAmount,
    );

    const decoder = getDecoder(tx);
    const result = await decoder.decode();

    expect(result.type).toBe('manage-position');
    const intentionData = result.intentionData as ManagePositionIntentionData;
    expect(intentionData.collateralType).toBe(COINS_TYPE_LIST.IOTA);
    expect(intentionData.collateralAmount).toBe(collateralAmount);
    expect(intentionData.borrowAmount).toBe(borrowAmount);
    expect(intentionData.repaymentAmount).toBe(repaymentAmount);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  });

  // --- Tank ---
  it('Test deposit stability pool', async () => {
    const tx = new Transaction();

    const vusdAmount = (10 ** 9).toString();
    const recipient = normalizeIotaAddress('0xABC');
    await buildDepositStabilityPoolTx(
      virtueClient,
      tx as any,
      testWallet.address,
      // vusdAmount
      vusdAmount,
      // recipient
      recipient,
    );

    const decoder = getDecoder(tx);
    const result = await decoder.decode();

    expect(result.type).toBe('deposit-stability-pool');
    const intentionData = result.intentionData as DepositStabilityPoolIntentionData;
    expect(intentionData.vusdAmount).toBe(vusdAmount);
    expect(intentionData.recipient).toBe(recipient);
  });

  it('Test deposit stability pool without recipient', async () => {
    const tx = new Transaction();

    const vusdAmount = (10 ** 6).toString();
    // recipient become sender
    const recipient = normalizeIotaAddress(testWallet.address);
    await buildDepositStabilityPoolTx(
      virtueClient,
      tx as any,
      testWallet.address,
      // vusdAmount
      vusdAmount,
      // recipient
      undefined,
    );

    const decoder = getDecoder(tx);
    const result = await decoder.decode();

    expect(result.type).toBe('deposit-stability-pool');
    const intentionData = result.intentionData as DepositStabilityPoolIntentionData;
    expect(intentionData.vusdAmount).toBe(vusdAmount);
    expect(intentionData.recipient).toBe(recipient);
  });

  it('Test withdraw stability pool', async () => {
    const tx = new Transaction();

    const vusdAmount = (10 ** 6).toString();
    const recipient = normalizeIotaAddress('0xABC');
    await buildWithdrawStabilityPoolTx(
      virtueClient,
      tx as any,
      testWallet.address,
      // vusdAmount
      vusdAmount,
      // recipient
      recipient,
    );

    const decoder = getDecoder(tx);
    const result = await decoder.decode();

    expect(result.type).toBe('withdraw-stability-pool');
    const intentionData = result.intentionData as WithdrawStabilityPoolIntentionData;
    expect(intentionData.vusdAmount).toBe(vusdAmount);
    expect(intentionData.recipient).toBe(recipient);
  });

  it('Test withdraw stability pool without recipient', async () => {
    const tx = new Transaction();

    const vusdAmount = (10 ** 6).toString();
    const recipient = testWallet.address;
    await buildWithdrawStabilityPoolTx(
      virtueClient,
      tx as any,
      testWallet.address,
      // vusdAmount
      vusdAmount,
      // recipient
      undefined,
    );

    const decoder = getDecoder(tx);
    const result = await decoder.decode();

    expect(result.type).toBe('withdraw-stability-pool');
    const intentionData = result.intentionData as WithdrawStabilityPoolIntentionData;
    expect(intentionData.vusdAmount).toBe(vusdAmount);
    expect(intentionData.recipient).toBe(recipient);
  });
});
