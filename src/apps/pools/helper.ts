import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { IotaSignTransactionInput, WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { MSafeAppHelper } from '@/apps/interface';
import { IotaNetworks } from '@/types';

import { Decoder } from './decoder';
import { AddLiquidityIntention, AddLiquidityIntentionData } from './intentions/addLiquidity';
import { ChangePoolTypeIntention, ChangePoolTypeIntentionData } from './intentions/changePoolType';
import { ClaimFeeIntention, ClaimFeeIntentionData } from './intentions/claimFee';
import { EmergencyUnstakeIntention, EmergencyUnstakeIntentionData } from './intentions/emergencyUnstake';
import { EnableEmergencyIntention, EnableEmergencyIntentionData } from './intentions/enableEmergency';
import { EnableGlobalEmergencyIntention, EnableGlobalEmergencyIntentionData } from './intentions/enableGlobalEmergency';
import { InitPoolClassicIntention, InitPoolClassicIntentionData } from './intentions/initPoolClassic';
import { InitPoolStableIntention, InitPoolStableIntentionData } from './intentions/initPoolStable';
import { RegisterPoolIntention, RegisterPoolIntentionData } from './intentions/registerPool';
import { RemoveLiquidityIntention, RemoveLiquidityIntentionData } from './intentions/removeLiquidity';
import {
  SetEmergencyAdminAddressIntention,
  SetEmergencyAdminAddressIntentionData,
} from './intentions/setEmergencyAdminAddress';
import { SetGlobalPauseStatusIntention, SetGlobalPauseStatusIntentionData } from './intentions/setGlobalPauseStatus';
import {
  SetNewPoolAmplificationIntention,
  SetNewPoolAmplificationIntentionData,
} from './intentions/setNewPoolAmplification';
import {
  SetTreasuryAdminAddressIntention,
  SetTreasuryAdminAddressIntentionData,
} from './intentions/setTreasuryAdminAddress';
import {
  WithdrawRewardToTreasuryIntention,
  WithdrawRewardToTreasuryIntentionData,
} from './intentions/withdrawRewardToTreasury';
import { TransactionSubType } from './types';

export type PoolsIntention =
  | AddLiquidityIntention
  | RemoveLiquidityIntention
  | InitPoolClassicIntention
  | InitPoolStableIntention
  | SetGlobalPauseStatusIntention
  | ClaimFeeIntention
  | SetNewPoolAmplificationIntention
  | ChangePoolTypeIntention
  | RegisterPoolIntention
  | EnableEmergencyIntention
  | EmergencyUnstakeIntention
  | EnableGlobalEmergencyIntention
  | WithdrawRewardToTreasuryIntention
  | SetTreasuryAdminAddressIntention
  | SetEmergencyAdminAddressIntention;

export type PoolsIntentionData =
  | AddLiquidityIntentionData
  | RemoveLiquidityIntentionData
  | InitPoolClassicIntentionData
  | InitPoolStableIntentionData
  | SetGlobalPauseStatusIntentionData
  | ClaimFeeIntentionData
  | SetNewPoolAmplificationIntentionData
  | ChangePoolTypeIntentionData
  | RegisterPoolIntentionData
  | EnableEmergencyIntentionData
  | EmergencyUnstakeIntentionData
  | EnableGlobalEmergencyIntentionData
  | WithdrawRewardToTreasuryIntentionData
  | SetTreasuryAdminAddressIntentionData
  | SetEmergencyAdminAddressIntentionData;

export class PoolsAppHelper implements MSafeAppHelper<PoolsIntentionData> {
  application = 'Pools';

  async deserialize(
    input: IotaSignTransactionInput & {
      network: IotaNetworks;
      client: IotaClient;
      account: WalletAccount;
    },
  ): Promise<{ txType: TransactionType; txSubType: string; intentionData: PoolsIntentionData }> {
    const decoder = new Decoder(input);
    const result = await decoder.decode();

    return {
      txType: result.txType,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    network: string;
    txType: TransactionType;
    txSubType: string;
    intentionData: PoolsIntentionData;
    client: IotaClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { client, account, txSubType, intentionData } = input;

    let intention: PoolsIntention;

    switch (txSubType) {
      case TransactionSubType.ADD_LIQUIDITY:
        intention = AddLiquidityIntention.fromData(intentionData as AddLiquidityIntentionData);
        break;
      case TransactionSubType.REMOVE_LIQUIDITY:
        intention = RemoveLiquidityIntention.fromData(intentionData as RemoveLiquidityIntentionData);
        break;
      case TransactionSubType.INIT_POOL_CLASSIC:
        intention = InitPoolClassicIntention.fromData(intentionData as InitPoolClassicIntentionData);
        break;
      case TransactionSubType.INIT_POOL_STABLE:
        intention = InitPoolStableIntention.fromData(intentionData as InitPoolStableIntentionData);
        break;
      case TransactionSubType.SET_GLOBAL_PAUSE_STATUS:
        intention = SetGlobalPauseStatusIntention.fromData(intentionData as SetGlobalPauseStatusIntentionData);
        break;
      case TransactionSubType.CLAIM_FEE:
        intention = ClaimFeeIntention.fromData(intentionData as ClaimFeeIntentionData);
        break;
      case TransactionSubType.SET_NEW_POOL_AMPLIFICATION:
        intention = SetNewPoolAmplificationIntention.fromData(intentionData as SetNewPoolAmplificationIntentionData);
        break;
      case TransactionSubType.CHANGE_POOL_TYPE:
        intention = ChangePoolTypeIntention.fromData(intentionData as ChangePoolTypeIntentionData);
        break;
      case TransactionSubType.REGISTER_POOL:
        intention = RegisterPoolIntention.fromData(intentionData as RegisterPoolIntentionData);
        break;
      case TransactionSubType.ENABLE_EMERGENCY:
        intention = EnableEmergencyIntention.fromData(intentionData as EnableEmergencyIntentionData);
        break;
      case TransactionSubType.EMERGENCY_UNSTAKE:
        intention = EmergencyUnstakeIntention.fromData(intentionData as EmergencyUnstakeIntentionData);
        break;
      case TransactionSubType.ENABLE_GLOBAL_EMERGENCY:
        intention = EnableGlobalEmergencyIntention.fromData(intentionData as EnableGlobalEmergencyIntentionData);
        break;
      case TransactionSubType.WITHDRAW_REWARD_TO_TREASURY:
        intention = WithdrawRewardToTreasuryIntention.fromData(intentionData as WithdrawRewardToTreasuryIntentionData);
        break;
      case TransactionSubType.SET_TREASURY_ADMIN_ADDRESS:
        intention = SetTreasuryAdminAddressIntention.fromData(intentionData as SetTreasuryAdminAddressIntentionData);
        break;
      case TransactionSubType.SET_EMERGENCY_ADMIN_ADDRESS:
        intention = SetEmergencyAdminAddressIntention.fromData(intentionData as SetEmergencyAdminAddressIntentionData);
        break;
      default:
        throw new Error(`Unsupported transaction subtype: ${txSubType}`);
    }

    return intention.build({ client, account });
  }
}
