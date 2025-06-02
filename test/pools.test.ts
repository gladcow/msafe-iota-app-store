import { TransactionType } from '@msafe/iota-utils';

// Import intention data types for core functionality
import { AddLiquidityIntentionData, AddLiquidityIntention } from '@/apps/pools/intentions/addLiquidity';
import { ChangePoolTypeIntentionData, ChangePoolTypeIntention } from '@/apps/pools/intentions/changePoolType';
import { ClaimFeeIntentionData } from '@/apps/pools/intentions/claimFee';
import { EmergencyUnstakeIntentionData } from '@/apps/pools/intentions/emergencyUnstake';
import { EnableEmergencyIntentionData } from '@/apps/pools/intentions/enableEmergency';
import {
  EnableGlobalEmergencyIntentionData,
  EnableGlobalEmergencyIntention,
} from '@/apps/pools/intentions/enableGlobalEmergency';
import { InitPoolClassicIntentionData } from '@/apps/pools/intentions/initPoolClassic';
import { InitPoolStableIntentionData } from '@/apps/pools/intentions/initPoolStable';
import { RegisterPoolIntentionData, RegisterPoolIntention } from '@/apps/pools/intentions/registerPool';
import { RemoveLiquidityIntentionData, RemoveLiquidityIntention } from '@/apps/pools/intentions/removeLiquidity';
import { SetEmergencyAdminAddressIntentionData } from '@/apps/pools/intentions/setEmergencyAdminAddress';
import { SetGlobalPauseStatusIntentionData } from '@/apps/pools/intentions/setGlobalPauseStatus';
import {
  SetNewPoolAmplificationIntentionData,
  SetNewPoolAmplificationIntention,
} from '@/apps/pools/intentions/setNewPoolAmplification';
import { SetTreasuryAdminAddressIntentionData } from '@/apps/pools/intentions/setTreasuryAdminAddress';
import { WithdrawRewardToTreasuryIntentionData } from '@/apps/pools/intentions/withdrawRewardToTreasury';
import { TransactionSubType } from '@/apps/pools/types';
import { appHelpers } from '@/index';

import { Account, Client } from './config';

describe('Pools Protocol Wallet', () => {
  const appHelper = appHelpers.getAppHelper('Pools');

  it('Should get correct app helper', () => {
    expect(appHelper.application).toBe('Pools');
  });

  // Mock data for tests
  const mockIds = {
    poolId: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456',
    globalConfigId: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    adminCapId: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    clockId: '0x6',
    rewardsCoinId: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
  };

  const mockCoinTypes = {
    coinA: '0x2::iota::IOTA',
    coinB: '0x3::usdt::USDT',
  };

  const mockAddress = '0x1111111111111111111111111111111111111111';

  // ========== LIQUIDITY MANAGEMENT TESTS ==========

  describe('Liquidity Management', () => {
    it('Add Liquidity transaction build', async () => {
      const intentionData: AddLiquidityIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        amountADesired: '1000000000',
        amountBDesired: '2000000000',
        amountAMin: '900000000',
        amountBMin: '1800000000',
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.ADD_LIQUIDITY,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Add Liquidity intention serialization', () => {
      const intentionData: AddLiquidityIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        amountADesired: '1000',
        amountBDesired: '2000',
        amountAMin: '950',
        amountBMin: '1900',
      };

      const intention = AddLiquidityIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.poolId).toBe(intentionData.poolId);
      expect(parsed.amountADesired).toBe(intentionData.amountADesired);
      expect(parsed.amountBDesired).toBe(intentionData.amountBDesired);
    });

    it('Remove Liquidity transaction build', async () => {
      const intentionData: RemoveLiquidityIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        amountLp: '1000000000',
        amountAMin: '900000000',
        amountBMin: '1800000000',
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.REMOVE_LIQUIDITY,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Remove Liquidity intention serialization', () => {
      const intentionData: RemoveLiquidityIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        amountLp: '1000',
        amountAMin: '950',
        amountBMin: '1900',
      };

      const intention = RemoveLiquidityIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.poolId).toBe(intentionData.poolId);
      expect(parsed.amountLp).toBe(intentionData.amountLp);
    });
  });

  // ========== POOL CREATION TESTS ==========

  describe('Pool Creation', () => {
    it('Init Pool Classic transaction build', async () => {
      const intentionData: InitPoolClassicIntentionData = {
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        globalCreatedPoolsId: mockIds.globalConfigId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.INIT_POOL_CLASSIC,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Init Pool Stable transaction build', async () => {
      const intentionData: InitPoolStableIntentionData = {
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        globalCreatedPoolsId: mockIds.globalConfigId,
        amplificationP: '100', // Required for stable pools
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.INIT_POOL_STABLE,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });
  });

  // ========== ADMIN OPERATIONS TESTS ==========

  describe('Admin Operations', () => {
    it('Set Global Pause Status transaction build', async () => {
      const intentionData: SetGlobalPauseStatusIntentionData = {
        adminCapId: mockIds.adminCapId,
        globalPauseStatusId: mockIds.globalConfigId,
        status: true,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.SET_GLOBAL_PAUSE_STATUS,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Claim Fee transaction build', async () => {
      const intentionData: ClaimFeeIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        adminCapId: mockIds.adminCapId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.CLAIM_FEE,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Set New Pool Amplification transaction build', async () => {
      const intentionData: SetNewPoolAmplificationIntentionData = {
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        adminCapId: mockIds.adminCapId,
        poolId: mockIds.poolId,
        newAmplification: '200',
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.SET_NEW_POOL_AMPLIFICATION,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Set New Pool Amplification intention serialization', () => {
      const intentionData: SetNewPoolAmplificationIntentionData = {
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        adminCapId: mockIds.adminCapId,
        poolId: mockIds.poolId,
        newAmplification: '150',
      };

      const intention = SetNewPoolAmplificationIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.poolId).toBe(intentionData.poolId);
      expect(parsed.newAmplification).toBe(intentionData.newAmplification);
      expect(parsed.adminCapId).toBe(intentionData.adminCapId);
    });

    it('Change Pool Type transaction build', async () => {
      const intentionData: ChangePoolTypeIntentionData = {
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        adminCapId: mockIds.adminCapId,
        poolId: mockIds.poolId,
        isStable: true,
        newAmplificationP: '100',
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.CHANGE_POOL_TYPE,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Change Pool Type intention serialization', () => {
      const intentionData: ChangePoolTypeIntentionData = {
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        adminCapId: mockIds.adminCapId,
        poolId: mockIds.poolId,
        isStable: false,
        newAmplificationP: '50',
      };

      const intention = ChangePoolTypeIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.poolId).toBe(intentionData.poolId);
      expect(parsed.isStable).toBe(intentionData.isStable);
      expect(parsed.newAmplificationP).toBe(intentionData.newAmplificationP);
      expect(parsed.adminCapId).toBe(intentionData.adminCapId);
    });
  });

  // ========== FARMING/STAKING TESTS ==========

  describe('Farming/Staking Operations', () => {
    it('Register Pool transaction build', async () => {
      const intentionData: RegisterPoolIntentionData = {
        stakeCoinType: mockCoinTypes.coinA,
        rewardCoinType: mockCoinTypes.coinB,
        rewardsCoinId: mockIds.rewardsCoinId, // Correct field name
        duration: '86400000', // 1 day in ms
        globalConfigId: mockIds.globalConfigId,
        decimalS: 9,
        decimalR: 9,
        clockId: mockIds.clockId,
        durationUnstakeTimeMs: '3600000', // 1 hour
        maxStakeValue: '10000000000',
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.REGISTER_POOL,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Register Pool intention serialization', () => {
      const intentionData: RegisterPoolIntentionData = {
        stakeCoinType: mockCoinTypes.coinA,
        rewardCoinType: mockCoinTypes.coinB,
        rewardsCoinId: mockIds.rewardsCoinId,
        duration: '86400',
        globalConfigId: mockIds.globalConfigId,
        decimalS: 9,
        decimalR: 6,
        clockId: mockIds.clockId,
        durationUnstakeTimeMs: '3600',
        maxStakeValue: '10000',
      };

      const intention = RegisterPoolIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.stakeCoinType).toBe(intentionData.stakeCoinType);
      expect(parsed.rewardsCoinId).toBe(intentionData.rewardsCoinId);
      expect(parsed.decimalS).toBe(intentionData.decimalS);
      expect(parsed.decimalR).toBe(intentionData.decimalR);
    });
  });

  // ========== EMERGENCY OPERATIONS TESTS ==========

  describe('Emergency Operations', () => {
    it('Enable Emergency transaction build', async () => {
      const intentionData: EnableEmergencyIntentionData = {
        stakeCoinType: mockCoinTypes.coinA,
        rewardCoinType: mockCoinTypes.coinB,
        poolId: mockIds.poolId,
        globalConfigId: mockIds.globalConfigId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.ENABLE_EMERGENCY,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Emergency Unstake transaction build', async () => {
      const intentionData: EmergencyUnstakeIntentionData = {
        stakeCoinType: mockCoinTypes.coinA,
        rewardCoinType: mockCoinTypes.coinB,
        poolId: mockIds.poolId,
        globalConfigId: mockIds.globalConfigId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.EMERGENCY_UNSTAKE,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Enable Global Emergency transaction build', async () => {
      const intentionData: EnableGlobalEmergencyIntentionData = {
        globalConfigId: mockIds.globalConfigId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.ENABLE_GLOBAL_EMERGENCY,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });
  });

  // ========== TREASURY OPERATIONS TESTS ==========

  describe('Treasury Operations', () => {
    it('Withdraw Reward To Treasury transaction build', async () => {
      const intentionData: WithdrawRewardToTreasuryIntentionData = {
        stakeCoinType: mockCoinTypes.coinA,
        rewardCoinType: mockCoinTypes.coinB,
        poolId: mockIds.poolId,
        amount: '1000000000',
        globalConfigId: mockIds.globalConfigId,
        clockId: mockIds.clockId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.WITHDRAW_REWARD_TO_TREASURY,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Set Treasury Admin Address transaction build', async () => {
      const intentionData: SetTreasuryAdminAddressIntentionData = {
        globalConfigId: mockIds.globalConfigId,
        newAddress: mockAddress,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.SET_TREASURY_ADMIN_ADDRESS,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });

    it('Set Emergency Admin Address transaction build', async () => {
      const intentionData: SetEmergencyAdminAddressIntentionData = {
        globalConfigId: mockIds.globalConfigId,
        newAddress: mockAddress,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.SET_EMERGENCY_ADMIN_ADDRESS,
        client: Client,
        account: Account,
        intentionData,
      });

      expect(res.blockData.version).toBe(1);
      expect(res.blockData.sender).toBe(Account.address);
    });
  });

  // ========== SERIALIZATION TESTS ==========

  describe('Intention Serialization', () => {
    it('Test AddLiquidity intention serialization', () => {
      const intentionData: AddLiquidityIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        amountADesired: '1000',
        amountBDesired: '2000',
        amountAMin: '950',
        amountBMin: '1900',
      };

      const intention = AddLiquidityIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(intentionData);
    });

    it('Test RegisterPool intention serialization', () => {
      const intentionData: RegisterPoolIntentionData = {
        stakeCoinType: 'stake',
        rewardCoinType: 'reward',
        rewardsCoinId: 'coin123',
        duration: '86400',
        globalConfigId: 'config123',
        decimalS: 9,
        decimalR: 6,
        clockId: '0x6',
        durationUnstakeTimeMs: '3600',
        maxStakeValue: '10000',
      };

      const intention = RegisterPoolIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(intentionData);
    });

    it('Test EnableGlobalEmergency intention serialization', () => {
      const intentionData: EnableGlobalEmergencyIntentionData = {
        globalConfigId: 'config123',
      };

      const intention = EnableGlobalEmergencyIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(intentionData);
    });
  });

  // ========== ERROR HANDLING TESTS ==========

  describe('Error Handling', () => {
    it('Should throw error for unsupported transaction subtype', async () => {
      await expect(
        appHelper.build({
          network: 'iota:testnet',
          txType: TransactionType.Other,
          txSubType: 'UNSUPPORTED_TYPE',
          client: Client,
          account: Account,
          intentionData: {} as any,
        }),
      ).rejects.toThrow('Unsupported transaction subtype: UNSUPPORTED_TYPE');
    });
  });

  // ========== DESERIALIZE TESTS ==========

  describe('Transaction Deserialization', () => {
    it('Should deserialize AddLiquidity transaction', async () => {
      const originalData: AddLiquidityIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        amountADesired: '1000000000',
        amountBDesired: '2000000000',
        amountAMin: '900000000',
        amountBMin: '1800000000',
      };

      // Build transaction
      const transaction = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.ADD_LIQUIDITY,
        client: Client,
        account: Account,
        intentionData: originalData,
      });

      // Deserialize transaction
      const result = await appHelper.deserialize({
        transaction,
        chain: 'iota:testnet',
        network: 'iota:testnet',
        client: Client,
        account: Account,
      });

      expect(result.txType).toBe(TransactionType.Assets);
      expect(result.txSubType).toBe(TransactionSubType.ADD_LIQUIDITY);
      expect(result.intentionData.coinTypeA).toBe(originalData.coinTypeA);
      expect(result.intentionData.coinTypeB).toBe(originalData.coinTypeB);
      expect(result.intentionData.poolId).toBe(originalData.poolId);
    });

    it('Should deserialize InitPoolClassic transaction', async () => {
      const originalData: InitPoolClassicIntentionData = {
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        globalCreatedPoolsId: mockIds.globalConfigId,
      };

      // Build transaction
      const transaction = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.INIT_POOL_CLASSIC,
        client: Client,
        account: Account,
        intentionData: originalData,
      });

      // Deserialize transaction
      const result = await appHelper.deserialize({
        transaction,
        chain: 'iota:testnet',
        network: 'iota:testnet',
        client: Client,
        account: Account,
      });

      expect(result.txType).toBe(TransactionType.Other);
      expect(result.txSubType).toBe(TransactionSubType.INIT_POOL_CLASSIC);
      expect(result.intentionData.coinTypeA).toBe(originalData.coinTypeA);
      expect(result.intentionData.coinTypeB).toBe(originalData.coinTypeB);
      expect(result.intentionData.globalCreatedPoolsId).toBe(originalData.globalCreatedPoolsId);
    });

    it('Should deserialize SetNewPoolAmplification transaction', async () => {
      const originalData: SetNewPoolAmplificationIntentionData = {
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        adminCapId: mockIds.adminCapId,
        poolId: mockIds.poolId,
        newAmplification: '200',
      };

      // Build transaction
      const transaction = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.SET_NEW_POOL_AMPLIFICATION,
        client: Client,
        account: Account,
        intentionData: originalData,
      });

      // Deserialize transaction
      const result = await appHelper.deserialize({
        transaction,
        chain: 'iota:testnet',
        network: 'iota:testnet',
        client: Client,
        account: Account,
      });

      expect(result.txType).toBe(TransactionType.Other);
      expect(result.txSubType).toBe(TransactionSubType.SET_NEW_POOL_AMPLIFICATION);
      expect(result.intentionData.coinTypeA).toBe(originalData.coinTypeA);
      expect(result.intentionData.coinTypeB).toBe(originalData.coinTypeB);
      expect(result.intentionData.newAmplification).toBe(originalData.newAmplification);
    });

    it('Should deserialize ChangePoolType transaction', async () => {
      const originalData: ChangePoolTypeIntentionData = {
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        adminCapId: mockIds.adminCapId,
        poolId: mockIds.poolId,
        isStable: true,
        newAmplificationP: '100',
      };

      // Build transaction
      const transaction = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.CHANGE_POOL_TYPE,
        client: Client,
        account: Account,
        intentionData: originalData,
      });

      // Deserialize transaction
      const result = await appHelper.deserialize({
        transaction,
        chain: 'iota:testnet',
        network: 'iota:testnet',
        client: Client,
        account: Account,
      });

      expect(result.txType).toBe(TransactionType.Other);
      expect(result.txSubType).toBe(TransactionSubType.CHANGE_POOL_TYPE);
      expect(result.intentionData.isStable).toBe(originalData.isStable);
      expect(result.intentionData.newAmplificationP).toBe(originalData.newAmplificationP);
    });

    it('Should deserialize RegisterPool transaction', async () => {
      const originalData: RegisterPoolIntentionData = {
        stakeCoinType: mockCoinTypes.coinA,
        rewardCoinType: mockCoinTypes.coinB,
        rewardsCoinId: mockIds.rewardsCoinId,
        duration: '86400000',
        globalConfigId: mockIds.globalConfigId,
        decimalS: 9,
        decimalR: 9,
        clockId: mockIds.clockId,
        durationUnstakeTimeMs: '3600000',
        maxStakeValue: '10000000000',
      };

      // Build transaction
      const transaction = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.REGISTER_POOL,
        client: Client,
        account: Account,
        intentionData: originalData,
      });

      // Deserialize transaction
      const result = await appHelper.deserialize({
        transaction,
        chain: 'iota:testnet',
        network: 'iota:testnet',
        client: Client,
        account: Account,
      });

      expect(result.txType).toBe(TransactionType.Other);
      expect(result.txSubType).toBe(TransactionSubType.REGISTER_POOL);
      expect(result.intentionData.stakeCoinType).toBe(originalData.stakeCoinType);
      expect(result.intentionData.rewardCoinType).toBe(originalData.rewardCoinType);
      expect(result.intentionData.decimalS).toBe(originalData.decimalS);
      expect(result.intentionData.decimalR).toBe(originalData.decimalR);
    });
  });
});
