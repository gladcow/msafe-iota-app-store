import { Transaction } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { HexToUint8Array } from '@msafe/iota-utils';
import { COINS_TYPE_LIST, buildManagePositionTx } from '@virtue/sdk';

import { getVirtueClient } from '@/apps/virtue/api/config';
import { Decoder } from '@/apps/virtue/decoder';
import { ManagePositionIntentionData } from '@/apps/virtue/types/api';

describe('Bucket App', () => {
  const testWallet: WalletAccount = {
    address: '0x95a98f0acbd5b5dc446d01f8b477e2f59f57b43d5f6bc3c68be4fd31ebfb12cd',
    publicKey: HexToUint8Array('76491b011bf1f90d253076e64a4b7e583b85b939b74d8f3a529b1c9d6a1bc72c'),
    chains: ['iota:mainnet'],
    features: [],
  };
  it('Test manage position', async () => {
    const tx = new Transaction();
    const virtueClient = getVirtueClient('iota:mainnet', testWallet);

    const collateralAmount = (10 ** 9).toString();
    const borrowAmount = (10 ** 6).toString();
    const repaymentAmount = '0';
    const withdrawAmount = '0';
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

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('manage-position');
    const intentionData = result.intentionData as ManagePositionIntentionData;
    expect(intentionData.collateralType).toBe(COINS_TYPE_LIST.IOTA);
    expect(intentionData.collateralAmount).toBe(collateralAmount);
    expect(intentionData.borrowAmount).toBe(borrowAmount);
    expect(intentionData.repaymentAmount).toBe(repaymentAmount);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
  });
});
