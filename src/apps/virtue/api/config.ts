import { WalletAccount } from '@iota/wallet-standard';
import { VirtueClient } from '@virtue/sdk';

import { IotaNetworks } from '@/types';

export const getVirtueClient = (network: IotaNetworks, account: WalletAccount) => {
  const config = network === 'iota:mainnet' ? 'mainnet' : 'testnet';
  return new VirtueClient(config, account.address);
};
