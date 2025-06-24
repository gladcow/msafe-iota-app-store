import { TransactionType } from '@msafe/iota-utils';

// Import intention data types for core functionality
import { AddLiquidityIntentionData, AddLiquidityIntention } from '@/apps/pools/intentions/addLiquidity';
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
import { SetTreasuryAdminAddressIntentionData } from '@/apps/pools/intentions/setTreasuryAdminAddress';
import { SwapAForExactBIntentionData, SwapAForExactBIntention } from '@/apps/pools/intentions/swapAForExactB';
import { SwapBForExactAIntentionData, SwapBForExactAIntention } from '@/apps/pools/intentions/swapBForExactA';
import { SwapExactAForBIntentionData, SwapExactAForBIntention } from '@/apps/pools/intentions/swapExactAForB';
import { SwapExactBForAIntentionData, SwapExactBForAIntention } from '@/apps/pools/intentions/swapExactBForA';
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
    pauseStatusId: '0x5555555555555555555555555555555555555555555555555555555555555555',
    coinLpId: '0x4444444444444444444444444444444444444444444444444444444444444444',
  };

  const mockCoinTypes = {
    coinA: '0x2::iota::IOTA',
    coinB: '0x2::sui::SUI',
  };

  const mockAddress = '0x1111111111111111111111111111111111111111';

  // ========== LIQUIDITY MANAGEMENT TESTS ==========

  describe('Liquidity Management', () => {
    it('Add Liquidity transaction build', async () => {
      const intentionData: AddLiquidityIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        coinAId: mockIds.rewardsCoinId,
        coinBId: mockIds.adminCapId,
        amountADesired: '1000000000', // 1 IOTA
        amountBDesired: '2000000000', // 2 SUI
        amountAMin: '900000000', // 0.9 IOTA (10% slippage)
        amountBMin: '1800000000', // 1.8 SUI (10% slippage)
        pauseStatusId: mockIds.pauseStatusId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.ADD_LIQUIDITY,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
    });

    it('Add Liquidity intention serialization', () => {
      const intentionData: AddLiquidityIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        coinAId: mockIds.rewardsCoinId,
        coinBId: mockIds.adminCapId,
        amountADesired: '1000',
        amountBDesired: '2000',
        amountAMin: '950',
        amountBMin: '1900',
        pauseStatusId: mockIds.pauseStatusId,
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
        coinLpId: mockIds.coinLpId,
        pauseStatusId: mockIds.pauseStatusId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.REMOVE_LIQUIDITY,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
    });

    it('Remove Liquidity intention serialization', () => {
      const intentionData: RemoveLiquidityIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        amountLp: '1000',
        amountAMin: '950',
        amountBMin: '1900',
        coinLpId: mockIds.coinLpId,
        pauseStatusId: mockIds.pauseStatusId,
      };

      const intention = RemoveLiquidityIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.poolId).toBe(intentionData.poolId);
      expect(parsed.amountLp).toBe(intentionData.amountLp);
    });
  });

  // ========== SWAP OPERATIONS TESTS ==========

  describe('Swap Operations', () => {
    it('Swap Exact A for B transaction build', async () => {
      const intentionData: SwapExactAForBIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        coinAId: mockIds.rewardsCoinId,
        amountAIn: '1000000000',
        amountBOutMin: '1900000000',
        pauseStatusId: mockIds.pauseStatusId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.SWAP_EXACT_A_FOR_B,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
    });

    it('Swap Exact B for A transaction build', async () => {
      const intentionData: SwapExactBForAIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        coinBId: mockIds.adminCapId,
        amountBIn: '2000000000',
        amountAOutMin: '950000000',
        pauseStatusId: mockIds.pauseStatusId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.SWAP_EXACT_B_FOR_A,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
    });

    it('Swap A for Exact B transaction build', async () => {
      const intentionData: SwapAForExactBIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        coinAId: mockIds.rewardsCoinId,
        amountAMax: '1100000000',
        amountBOut: '2000000000',
        pauseStatusId: mockIds.pauseStatusId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.SWAP_A_FOR_EXACT_B,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
    });

    it('Swap B for Exact A transaction build', async () => {
      const intentionData: SwapBForExactAIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        coinBId: mockIds.adminCapId,
        amountBMax: '2100000000',
        amountAOut: '1000000000',
        pauseStatusId: mockIds.pauseStatusId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.SWAP_B_FOR_EXACT_A,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
    });

    it('Swap Exact A for B intention serialization', () => {
      const intentionData: SwapExactAForBIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        coinAId: 'coinA123',
        amountAIn: '1000',
        amountBOutMin: '1900',
        pauseStatusId: 'pause123',
      };

      const intention = SwapExactAForBIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.poolId).toBe(intentionData.poolId);
      expect(parsed.coinAId).toBe(intentionData.coinAId);
      expect(parsed.amountAIn).toBe(intentionData.amountAIn);
      expect(parsed.amountBOutMin).toBe(intentionData.amountBOutMin);
    });

    it('Swap Exact B for A intention serialization', () => {
      const intentionData: SwapExactBForAIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        coinBId: 'coinB123',
        amountBIn: '2000',
        amountAOutMin: '950',
        pauseStatusId: 'pause123',
      };

      const intention = SwapExactBForAIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.poolId).toBe(intentionData.poolId);
      expect(parsed.coinBId).toBe(intentionData.coinBId);
      expect(parsed.amountBIn).toBe(intentionData.amountBIn);
      expect(parsed.amountAOutMin).toBe(intentionData.amountAOutMin);
    });

    it('Swap A for Exact B intention serialization', () => {
      const intentionData: SwapAForExactBIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        coinAId: 'coinA123',
        amountAMax: '1100',
        amountBOut: '2000',
        pauseStatusId: 'pause123',
      };

      const intention = SwapAForExactBIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.poolId).toBe(intentionData.poolId);
      expect(parsed.coinAId).toBe(intentionData.coinAId);
      expect(parsed.amountAMax).toBe(intentionData.amountAMax);
      expect(parsed.amountBOut).toBe(intentionData.amountBOut);
    });

    it('Swap B for Exact A intention serialization', () => {
      const intentionData: SwapBForExactAIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        coinBId: 'coinB123',
        amountBMax: '2100',
        amountAOut: '1000',
        pauseStatusId: 'pause123',
      };

      const intention = SwapBForExactAIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.poolId).toBe(intentionData.poolId);
      expect(parsed.coinBId).toBe(intentionData.coinBId);
      expect(parsed.amountBMax).toBe(intentionData.amountBMax);
      expect(parsed.amountAOut).toBe(intentionData.amountAOut);
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

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
    });

    it('Init Pool Stable transaction build', async () => {
      const intentionData: InitPoolStableIntentionData = {
        coinTypeA: mockCoinTypes.coinA,
        coinTypeB: mockCoinTypes.coinB,
        globalCreatedPoolsId: mockIds.globalConfigId,
        amplificationP: '100',
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.INIT_POOL_STABLE,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
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

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
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

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
    });
  });

  // ========== FARMING/STAKING TESTS ==========

  describe('Farming/Staking Operations', () => {
    it('Register Pool transaction build', async () => {
      const intentionData: RegisterPoolIntentionData = {
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

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Other,
        txSubType: TransactionSubType.REGISTER_POOL,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
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

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
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

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
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

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
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

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
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

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
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

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');
    });
  });

  // ========== SERIALIZATION TESTS ==========

  describe('Intention Serialization', () => {
    it('Test AddLiquidity intention serialization', () => {
      const intentionData: AddLiquidityIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        coinAId: 'coinA123',
        coinBId: 'coinB123',
        amountADesired: '1000',
        amountBDesired: '2000',
        amountAMin: '950',
        amountBMin: '1900',
        pauseStatusId: 'pause123',
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

    it('Test SwapExactAForB intention serialization', () => {
      const intentionData: SwapExactAForBIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        coinAId: 'coinA123',
        amountAIn: '1000',
        amountBOutMin: '1900',
        pauseStatusId: 'pause123',
      };

      const intention = SwapExactAForBIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(intentionData);
    });

    it('Test SwapAForExactB intention serialization', () => {
      const intentionData: SwapAForExactBIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        coinAId: 'coinA123',
        amountAMax: '1100',
        amountBOut: '2000',
        pauseStatusId: 'pause123',
      };

      const intention = SwapAForExactBIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(intentionData);
    });

    it('Decoder should return same structure as RegisterPool intention', () => {
      const intentionData: RegisterPoolIntentionData = {
        stakeCoinType: 'stakeCoin',
        rewardCoinType: 'rewardCoin',
        rewardsCoinId: 'rewards123',
        duration: '86400000',
        decimalS: 8,
        decimalR: 6,
        durationUnstakeTimeMs: '3600000',
        maxStakeValue: '1000000000',
        globalConfigId: 'config123',
        clockId: 'clock123',
      };

      const intention = RegisterPoolIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(intentionData);
    });
  });

  // ========== NATIVE IOTA TESTS ==========

  describe('Native IOTA Integration', () => {
    const nativeIotaCoinType = '0x2::iota::IOTA';
    const otherCoinType = '0x2::sui::SUI';
    const nativeIotaCoinId = '0x1111111111111111111111111111111111111111111111111111111111111111';

    it('Add Liquidity with native IOTA as coinA', async () => {
      const intentionData: AddLiquidityIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: nativeIotaCoinType,
        coinTypeB: otherCoinType,
        coinAId: nativeIotaCoinId,
        coinBId: mockIds.adminCapId,
        amountADesired: '1000000000',
        amountBDesired: '2000000000',
        amountAMin: '900000000',
        amountBMin: '1800000000',
        pauseStatusId: mockIds.pauseStatusId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.ADD_LIQUIDITY,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');

      expect(() => JSON.stringify(txData)).not.toThrow();
    });

    it('Swap Exact IOTA for other token', async () => {
      const intentionData: SwapExactAForBIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: nativeIotaCoinType,
        coinTypeB: otherCoinType,
        coinAId: nativeIotaCoinId,
        amountAIn: '1000000000',
        amountBOutMin: '1900000000',
        pauseStatusId: mockIds.pauseStatusId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.SWAP_EXACT_A_FOR_B,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');

      expect(() => JSON.stringify(txData)).not.toThrow();

      const serialized = JSON.stringify(txData);
      expect(serialized).not.toContain('NestedResult');
    });

    it('Swap other token for exact IOTA', async () => {
      const intentionData: SwapAForExactBIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: otherCoinType,
        coinTypeB: nativeIotaCoinType,
        coinAId: mockIds.rewardsCoinId,
        amountAMax: '1100000000',
        amountBOut: '1000000000',
        pauseStatusId: mockIds.pauseStatusId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.SWAP_A_FOR_EXACT_B,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');

      expect(() => JSON.stringify(txData)).not.toThrow();
    });

    it('Remove Liquidity with native IOTA pool', async () => {
      const intentionData: RemoveLiquidityIntentionData = {
        poolId: mockIds.poolId,
        coinTypeA: nativeIotaCoinType,
        coinTypeB: otherCoinType,
        amountLp: '1000000000',
        amountAMin: '900000000',
        amountBMin: '1800000000',
        coinLpId: mockIds.coinLpId,
        pauseStatusId: mockIds.pauseStatusId,
      };

      const res = await appHelper.build({
        network: 'iota:testnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubType.REMOVE_LIQUIDITY,
        client: Client,
        account: Account,
        intentionData,
      });

      const txData = res.getData();
      expect(txData.sender).toBe(Account.address);
      expect(txData.commands).toHaveLength(1);
      expect(txData.commands[0].$kind).toBe('MoveCall');

      expect(() => JSON.stringify(txData)).not.toThrow();
    });

    it('Native IOTA intention serialization', () => {
      const intentionData: SwapExactAForBIntentionData = {
        poolId: 'pool123',
        coinTypeA: nativeIotaCoinType,
        coinTypeB: 'coinB',
        coinAId: 'nativeIota123',
        amountAIn: '1000',
        amountBOutMin: '1900',
        pauseStatusId: 'pause123',
      };

      const intention = SwapExactAForBIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.coinTypeA).toBe(nativeIotaCoinType);
      expect(parsed.coinAId).toBe('nativeIota123');
      expect(parsed.amountAIn).toBe('1000');
      expect(parsed.amountBOutMin).toBe('1900');
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

  describe('Decoder Structure Validation', () => {
    it('Decoder should return same structure as AddLiquidity intention', () => {
      const intentionData: AddLiquidityIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        coinAId: 'coinA123',
        coinBId: 'coinB123',
        amountADesired: '1000',
        amountBDesired: '2000',
        amountAMin: '950',
        amountBMin: '1900',
        pauseStatusId: 'pause123',
      };

      const intention = AddLiquidityIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(intentionData);
    });

    it('Decoder should return same structure as RemoveLiquidity intention', () => {
      const intentionData: RemoveLiquidityIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        amountLp: '1000',
        amountAMin: '950',
        amountBMin: '1900',
        coinLpId: 'coinLp123',
        pauseStatusId: 'pause123',
      };

      const intention = RemoveLiquidityIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(intentionData);
    });

    it('Decoder should return same structure as SwapExactAForB intention', () => {
      const intentionData: SwapExactAForBIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        coinAId: 'coinA123',
        amountAIn: '1000',
        amountBOutMin: '1900',
        pauseStatusId: 'pause123',
      };

      const intention = SwapExactAForBIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(intentionData);
    });

    it('Decoder should return same structure as SwapAForExactB intention', () => {
      const intentionData: SwapAForExactBIntentionData = {
        poolId: 'pool123',
        coinTypeA: 'coinA',
        coinTypeB: 'coinB',
        coinAId: 'coinA123',
        amountAMax: '1100',
        amountBOut: '2000',
        pauseStatusId: 'pause123',
      };

      const intention = SwapAForExactBIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(intentionData);
    });

    it('Decoder should return same structure as RegisterPool intention', () => {
      const intentionData: RegisterPoolIntentionData = {
        stakeCoinType: 'stakeCoin',
        rewardCoinType: 'rewardCoin',
        rewardsCoinId: 'rewards123',
        duration: '86400000',
        decimalS: 8,
        decimalR: 6,
        durationUnstakeTimeMs: '3600000',
        maxStakeValue: '1000000000',
        globalConfigId: 'config123',
        clockId: 'clock123',
      };

      const intention = RegisterPoolIntention.fromData(intentionData);
      const serialized = intention.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(intentionData);
    });
  });
});
