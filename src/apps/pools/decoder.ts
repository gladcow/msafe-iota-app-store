import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { IotaSignTransactionInput, WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';

import { IotaNetworks } from '@/types';

import config from './config';
import { TransactionSubType } from './types';

type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: any;
};

export class Decoder {
  constructor(
    private readonly input: IotaSignTransactionInput & {
      network: IotaNetworks;
      client: IotaClient;
      account: WalletAccount;
    },
  ) {}

  async decode(): Promise<DecodeResult> {
    const { transaction } = this.input;

    const txContent = await transaction.toJSON();
    const tx = Transaction.from(txContent);

    const txData = tx.getData();
    this.txInputs = txData.inputs || [];

    // Liquidity Management
    if (this.isAddLiquidityTransaction(txData)) {
      return this.decodeAddLiquidity(txData);
    }

    if (this.isRemoveLiquidityTransaction(txData)) {
      return this.decodeRemoveLiquidity(txData);
    }

    // Pool Creation
    if (this.isInitPoolClassicTransaction(txData)) {
      return this.decodeInitPoolClassic(txData);
    }

    if (this.isInitPoolStableTransaction(txData)) {
      return this.decodeInitPoolStable(txData);
    }

    // Admin Operations
    if (this.isSetGlobalPauseStatusTransaction(txData)) {
      return this.decodeSetGlobalPauseStatus(txData);
    }

    if (this.isClaimFeeTransaction(txData)) {
      return this.decodeClaimFee(txData);
    }

    if (this.isSetNewPoolAmplificationTransaction(txData)) {
      return this.decodeSetNewPoolAmplification(txData);
    }

    if (this.isChangePoolTypeTransaction(txData)) {
      return this.decodeChangePoolType(txData);
    }

    // Farming/Staking Operations
    if (this.isRegisterPoolTransaction(txData)) {
      return this.decodeRegisterPool(txData);
    }

    if (this.isEnableEmergencyTransaction(txData)) {
      return this.decodeEnableEmergency(txData);
    }

    if (this.isEmergencyUnstakeTransaction(txData)) {
      return this.decodeEmergencyUnstake(txData);
    }

    if (this.isWithdrawRewardToTreasuryTransaction(txData)) {
      return this.decodeWithdrawRewardToTreasury(txData);
    }

    if (this.isEnableGlobalEmergencyTransaction(txData)) {
      return this.decodeEnableGlobalEmergency(txData);
    }

    if (this.isSetTreasuryAdminAddressTransaction(txData)) {
      return this.decodeSetTreasuryAdminAddress(txData);
    }

    if (this.isSetEmergencyAdminAddressTransaction(txData)) {
      return this.decodeSetEmergencyAdminAddress(txData);
    }

    throw new Error('Unknown transaction type');
  }

  // Store transaction inputs for value extraction
  private txInputs: any[] = [];

  // ========== DETECTION METHODS ==========

  private isAddLiquidityTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.poolEntry, config.addLiquidityMethod);
  }

  private isRemoveLiquidityTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.poolEntry, config.removeLiquidityMethod);
  }

  private isInitPoolClassicTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.poolEntry, config.initPoolClassicMethod);
  }

  private isInitPoolStableTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.poolEntry, config.initPoolStableMethod);
  }

  private isSetGlobalPauseStatusTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.poolEntry, config.setGlobalPauseStatusMethod);
  }

  private isClaimFeeTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.poolEntry, config.claimFeeMethod);
  }

  private isSetNewPoolAmplificationTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.poolEntry, config.setNewPoolAmplificationMethod);
  }

  private isChangePoolTypeTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.poolEntry, config.changePoolTypeMethod);
  }

  private isRegisterPoolTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.stakeEntry, config.registerPoolMethod);
  }

  private isEnableEmergencyTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.stakeEntry, config.enableEmergencyMethod);
  }

  private isEmergencyUnstakeTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.stakeEntry, config.emergencyUnstakeMethod);
  }

  private isWithdrawRewardToTreasuryTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(
      txData,
      config.moduleId,
      config.stakeEntry,
      config.withdrawRewardToTreasuryMethod,
    );
  }

  private isEnableGlobalEmergencyTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.stakeEntry, config.enableGlobalEmergencyMethod);
  }

  private isSetTreasuryAdminAddressTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.stakeEntry, config.setTreasuryAdminAddressMethod);
  }

  private isSetEmergencyAdminAddressTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(
      txData,
      config.moduleId,
      config.stakeEntry,
      config.setEmergencyAdminAddressMethod,
    );
  }

  // ========== HELPER METHODS ==========

  private hasMoveCallWithTarget(txData: any, packageId: string, module: string, functionName: string): boolean {
    if (!txData || !txData.commands) {
      return false;
    }

    return txData.commands.some(
      (cmd: any) =>
        cmd.$kind === 'MoveCall' &&
        cmd.MoveCall &&
        cmd.MoveCall.package === packageId &&
        cmd.MoveCall.module === module &&
        cmd.MoveCall.function === functionName,
    );
  }

  private getMoveCallCommand(txData: any, packageId: string, module: string, functionName: string): any {
    if (!txData || !txData.commands) {
      return null;
    }

    return txData.commands.find(
      (cmd: any) =>
        cmd.$kind === 'MoveCall' &&
        cmd.MoveCall &&
        cmd.MoveCall.package === packageId &&
        cmd.MoveCall.module === module &&
        cmd.MoveCall.function === functionName,
    );
  }

  // ========== DECODE METHODS ==========

  private decodeAddLiquidity(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(txData, config.moduleId, config.poolEntry, config.addLiquidityMethod);

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid add_liquidity transaction structure');
    }

    const { typeArguments, arguments: args } = moveCallCmd.MoveCall;

    if (!typeArguments || typeArguments.length < 2 || !args || args.length < 6) {
      throw new Error('Invalid add_liquidity payload structure');
    }

    const [coinTypeA, coinTypeB] = typeArguments;

    const poolId = this.extractObjectId(args[0]);
    // skip args[1] - pauseStatusId
    const amountADesired = this.extractU64Value(args[2]);
    const amountBDesired = this.extractU64Value(args[3]);
    const amountAMin = this.extractU64Value(args[4]);
    const amountBMin = this.extractU64Value(args[5]);

    return {
      txType: TransactionType.Assets,
      type: TransactionSubType.ADD_LIQUIDITY,
      intentionData: {
        coinTypeA,
        coinTypeB,
        amountADesired: amountADesired.toString(),
        amountBDesired: amountBDesired.toString(),
        amountAMin: amountAMin.toString(),
        amountBMin: amountBMin.toString(),
        poolId,
      },
    };
  }

  private decodeRemoveLiquidity(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(
      txData,
      config.moduleId,
      config.poolEntry,
      config.removeLiquidityMethod,
    );

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid remove_liquidity transaction structure');
    }

    const { typeArguments, arguments: args } = moveCallCmd.MoveCall;

    if (!typeArguments || typeArguments.length < 2 || !args || args.length < 5) {
      throw new Error('Invalid remove_liquidity payload structure');
    }

    const [coinTypeA, coinTypeB] = typeArguments;

    const poolId = this.extractObjectId(args[0]);
    // skip args[1] - pauseStatusId
    const amountLp = this.extractU64Value(args[2]);
    const amountAMin = this.extractU64Value(args[3]);
    const amountBMin = this.extractU64Value(args[4]);

    return {
      txType: TransactionType.Assets,
      type: TransactionSubType.REMOVE_LIQUIDITY,
      intentionData: {
        coinTypeA,
        coinTypeB,
        amountLp: amountLp.toString(),
        amountAMin: amountAMin.toString(),
        amountBMin: amountBMin.toString(),
        poolId,
      },
    };
  }

  private decodeInitPoolClassic(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(
      txData,
      config.moduleId,
      config.poolEntry,
      config.initPoolClassicMethod,
    );

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid init_pool_classic transaction structure');
    }

    const { typeArguments, arguments: args } = moveCallCmd.MoveCall;

    if (!typeArguments || typeArguments.length < 2 || !args || args.length < 1) {
      throw new Error('Invalid init_pool_classic payload structure');
    }

    const [coinTypeA, coinTypeB] = typeArguments;
    const globalCreatedPoolsId = this.extractObjectId(args[0]);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.INIT_POOL_CLASSIC,
      intentionData: {
        coinTypeA,
        coinTypeB,
        globalCreatedPoolsId,
      },
    };
  }

  private decodeInitPoolStable(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(txData, config.moduleId, config.poolEntry, config.initPoolStableMethod);

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid init_pool_stable transaction structure');
    }

    const { typeArguments, arguments: args } = moveCallCmd.MoveCall;

    if (!typeArguments || typeArguments.length < 2 || !args || args.length < 2) {
      throw new Error('Invalid init_pool_stable payload structure');
    }

    const [coinTypeA, coinTypeB] = typeArguments;
    const globalCreatedPoolsId = this.extractObjectId(args[0]);
    const amplificationP = this.extractU64Value(args[1]);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.INIT_POOL_STABLE,
      intentionData: {
        coinTypeA,
        coinTypeB,
        globalCreatedPoolsId,
        amplificationP: amplificationP.toString(),
      },
    };
  }

  private decodeSetGlobalPauseStatus(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(
      txData,
      config.moduleId,
      config.poolEntry,
      config.setGlobalPauseStatusMethod,
    );

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid set_global_pause_status transaction structure');
    }

    const { arguments: args } = moveCallCmd.MoveCall;

    if (!args || args.length < 3) {
      throw new Error('Invalid set_global_pause_status payload structure');
    }

    const adminCapId = this.extractObjectId(args[0]);
    const globalPauseStatusId = this.extractObjectId(args[1]);
    const status = this.extractBoolValue(args[2]);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SET_GLOBAL_PAUSE_STATUS,
      intentionData: {
        adminCapId,
        globalPauseStatusId,
        status,
      },
    };
  }

  private decodeClaimFee(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(txData, config.moduleId, config.poolEntry, config.claimFeeMethod);

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid claim_fee transaction structure');
    }

    const { typeArguments, arguments: args } = moveCallCmd.MoveCall;

    if (!typeArguments || typeArguments.length < 2 || !args || args.length < 2) {
      throw new Error('Invalid claim_fee payload structure');
    }

    const [coinTypeA, coinTypeB] = typeArguments;
    const adminCapId = this.extractObjectId(args[0]);
    const poolId = this.extractObjectId(args[1]);

    return {
      txType: TransactionType.Assets,
      type: TransactionSubType.CLAIM_FEE,
      intentionData: {
        coinTypeA,
        coinTypeB,
        adminCapId,
        poolId,
      },
    };
  }

  private decodeSetNewPoolAmplification(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(
      txData,
      config.moduleId,
      config.poolEntry,
      config.setNewPoolAmplificationMethod,
    );

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid set_new_pool_amplification transaction structure');
    }

    const { typeArguments, arguments: args } = moveCallCmd.MoveCall;

    if (!typeArguments || typeArguments.length < 2 || !args || args.length < 3) {
      throw new Error('Invalid set_new_pool_amplification payload structure');
    }

    const [coinTypeA, coinTypeB] = typeArguments;
    const adminCapId = this.extractObjectId(args[0]);
    const poolId = this.extractObjectId(args[1]);
    const newAmplification = this.extractU64Value(args[2]);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SET_NEW_POOL_AMPLIFICATION,
      intentionData: {
        coinTypeA,
        coinTypeB,
        adminCapId,
        poolId,
        newAmplification: newAmplification.toString(),
      },
    };
  }

  private decodeChangePoolType(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(txData, config.moduleId, config.poolEntry, config.changePoolTypeMethod);

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid change_pool_type transaction structure');
    }

    const { typeArguments, arguments: args } = moveCallCmd.MoveCall;

    if (!typeArguments || typeArguments.length < 2 || !args || args.length < 4) {
      throw new Error('Invalid change_pool_type payload structure');
    }

    const [coinTypeA, coinTypeB] = typeArguments;
    const adminCapId = this.extractObjectId(args[0]);
    const poolId = this.extractObjectId(args[1]);
    const isStable = this.extractBoolValue(args[2]);
    const newAmplificationP = this.extractU64Value(args[3]);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CHANGE_POOL_TYPE,
      intentionData: {
        coinTypeA,
        coinTypeB,
        adminCapId,
        poolId,
        isStable,
        newAmplificationP: newAmplificationP.toString(),
      },
    };
  }

  private decodeRegisterPool(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(txData, config.moduleId, config.stakeEntry, config.registerPoolMethod);

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid register_pool transaction structure');
    }

    const { typeArguments, arguments: args } = moveCallCmd.MoveCall;

    if (!typeArguments || typeArguments.length < 2 || !args || args.length < 8) {
      throw new Error('Invalid register_pool payload structure');
    }

    const [stakeCoinType, rewardCoinType] = typeArguments;
    const rewardsCoinId = this.extractObjectId(args[0]);
    const duration = this.extractU64Value(args[1]);
    const globalConfigId = this.extractObjectId(args[2]);
    const decimalS = this.extractU8Value(args[3]);
    const decimalR = this.extractU8Value(args[4]);
    const clockId = this.extractObjectId(args[5]);
    const durationUnstakeTimeMs = this.extractU64Value(args[6]);
    const maxStakeValue = this.extractU64Value(args[7]);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.REGISTER_POOL,
      intentionData: {
        stakeCoinType,
        rewardCoinType,
        rewardsCoinId,
        duration: duration.toString(),
        globalConfigId,
        decimalS,
        decimalR,
        clockId,
        durationUnstakeTimeMs: durationUnstakeTimeMs.toString(),
        maxStakeValue: maxStakeValue.toString(),
      },
    };
  }

  private decodeEnableEmergency(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(
      txData,
      config.moduleId,
      config.stakeEntry,
      config.enableEmergencyMethod,
    );

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid enable_emergency transaction structure');
    }

    const { typeArguments, arguments: args } = moveCallCmd.MoveCall;

    if (!typeArguments || typeArguments.length < 2 || !args || args.length < 2) {
      throw new Error('Invalid enable_emergency payload structure');
    }

    const [stakeCoinType, rewardCoinType] = typeArguments;
    const poolId = this.extractObjectId(args[0]);
    const globalConfigId = this.extractObjectId(args[1]);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.ENABLE_EMERGENCY,
      intentionData: {
        stakeCoinType,
        rewardCoinType,
        poolId,
        globalConfigId,
      },
    };
  }

  private decodeEmergencyUnstake(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(
      txData,
      config.moduleId,
      config.stakeEntry,
      config.emergencyUnstakeMethod,
    );

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid emergency_unstake transaction structure');
    }

    const { typeArguments, arguments: args } = moveCallCmd.MoveCall;

    if (!typeArguments || typeArguments.length < 2 || !args || args.length < 2) {
      throw new Error('Invalid emergency_unstake payload structure');
    }

    const [stakeCoinType, rewardCoinType] = typeArguments;
    const poolId = this.extractObjectId(args[0]);
    const globalConfigId = this.extractObjectId(args[1]);

    return {
      txType: TransactionType.Assets,
      type: TransactionSubType.EMERGENCY_UNSTAKE,
      intentionData: {
        stakeCoinType,
        rewardCoinType,
        poolId,
        globalConfigId,
      },
    };
  }

  private decodeWithdrawRewardToTreasury(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(
      txData,
      config.moduleId,
      config.stakeEntry,
      config.withdrawRewardToTreasuryMethod,
    );

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid withdraw_reward_to_treasury transaction structure');
    }

    const { typeArguments, arguments: args } = moveCallCmd.MoveCall;

    if (!typeArguments || typeArguments.length < 2 || !args || args.length < 4) {
      throw new Error('Invalid withdraw_reward_to_treasury payload structure');
    }

    const [stakeCoinType, rewardCoinType] = typeArguments;
    const poolId = this.extractObjectId(args[0]);
    const amount = this.extractU64Value(args[1]);
    const globalConfigId = this.extractObjectId(args[2]);
    const clockId = this.extractObjectId(args[3]);

    return {
      txType: TransactionType.Assets,
      type: TransactionSubType.WITHDRAW_REWARD_TO_TREASURY,
      intentionData: {
        stakeCoinType,
        rewardCoinType,
        poolId,
        amount: amount.toString(),
        globalConfigId,
        clockId,
      },
    };
  }

  private decodeEnableGlobalEmergency(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(
      txData,
      config.moduleId,
      config.stakeEntry,
      config.enableGlobalEmergencyMethod,
    );

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid enable_global_emergency transaction structure');
    }

    const { arguments: args } = moveCallCmd.MoveCall;

    if (!args || args.length < 1) {
      throw new Error('Invalid enable_global_emergency payload structure');
    }

    const globalConfigId = this.extractObjectId(args[0]);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.ENABLE_GLOBAL_EMERGENCY,
      intentionData: {
        globalConfigId,
      },
    };
  }

  private decodeSetTreasuryAdminAddress(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(
      txData,
      config.moduleId,
      config.stakeEntry,
      config.setTreasuryAdminAddressMethod,
    );

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid set_treasury_admin_address transaction structure');
    }

    const { arguments: args } = moveCallCmd.MoveCall;

    if (!args || args.length < 2) {
      throw new Error('Invalid set_treasury_admin_address payload structure');
    }

    const globalConfigId = this.extractObjectId(args[0]);
    const newAddress = this.extractAddressValue(args[1]);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SET_TREASURY_ADMIN_ADDRESS,
      intentionData: {
        globalConfigId,
        newAddress,
      },
    };
  }

  private decodeSetEmergencyAdminAddress(txData: any): DecodeResult {
    const moveCallCmd = this.getMoveCallCommand(
      txData,
      config.moduleId,
      config.stakeEntry,
      config.setEmergencyAdminAddressMethod,
    );

    if (!moveCallCmd || !moveCallCmd.MoveCall) {
      throw new Error('Invalid set_emergency_admin_address transaction structure');
    }

    const { arguments: args } = moveCallCmd.MoveCall;

    if (!args || args.length < 2) {
      throw new Error('Invalid set_emergency_admin_address payload structure');
    }

    const globalConfigId = this.extractObjectId(args[0]);
    const newAddress = this.extractAddressValue(args[1]);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SET_EMERGENCY_ADMIN_ADDRESS,
      intentionData: {
        globalConfigId,
        newAddress,
      },
    };
  }

  // ========== EXTRACTION HELPER METHODS ==========

  private extractObjectId(arg: any): string {
    // Handle Input references
    if (arg && arg.$kind === 'Input' && typeof arg.Input === 'number') {
      const inputIndex = arg.Input;
      if (this.txInputs && this.txInputs[inputIndex]) {
        const input = this.txInputs[inputIndex];

        // Handle UnresolvedObject type
        if (input.$kind === 'UnresolvedObject' && input.UnresolvedObject && input.UnresolvedObject.objectId) {
          return input.UnresolvedObject.objectId;
        }

        // Handle other input types
        if (input.type === 'object' && input.objectId) {
          return input.objectId;
        }
        if (input.type === 'pure' && input.value) {
          return String(input.value);
        }
        if (typeof input === 'string') {
          return input;
        }
        if (input.Object && typeof input.Object === 'string') {
          return input.Object;
        }
        if (input.Object && input.Object.ImmOrOwned) {
          return input.Object.ImmOrOwned;
        }
      }
      return inputIndex.toString();
    }

    // Handle direct Pure values
    if (arg && arg.$kind === 'Pure' && arg.Pure) {
      if (typeof arg.Pure === 'string') {
        return arg.Pure;
      }
      if (Array.isArray(arg.Pure) && arg.Pure.length > 0) {
        return arg.Pure.join('');
      }
    }

    if (arg && typeof arg === 'object') {
      if (arg.objectId) {
        return arg.objectId;
      }
      if (arg.Object && typeof arg.Object === 'string') {
        return arg.Object;
      }
      if (arg.Object && arg.Object.ImmOrOwned && typeof arg.Object.ImmOrOwned === 'string') {
        return arg.Object.ImmOrOwned;
      }
    }

    if (typeof arg === 'string') {
      return arg;
    }

    return String(arg);
  }

  private extractU64Value(arg: any): bigint {
    // Handle Input references
    if (arg && arg.$kind === 'Input' && typeof arg.Input === 'number') {
      const inputIndex = arg.Input;
      if (this.txInputs && this.txInputs[inputIndex]) {
        const input = this.txInputs[inputIndex];

        // Handle Pure type with base64 bytes
        if (input.$kind === 'Pure' && input.Pure && input.Pure.bytes) {
          // Decode base64 bytes to get the actual value
          const bytes = Buffer.from(input.Pure.bytes, 'base64');
          // Convert bytes to bigint (little-endian)
          let value = BigInt(0);
          for (let i = 0; i < bytes.length; i++) {
            // eslint-disable-next-line no-bitwise
            value += BigInt(bytes[i]) << BigInt(i * 8);
          }
          return value;
        }

        // Handle other input types
        if (input.type === 'pure' && input.value !== undefined) {
          return BigInt(input.value);
        }
        if (typeof input === 'number' || typeof input === 'string') {
          return BigInt(input);
        }
      }
      return BigInt(inputIndex);
    }

    // Handle direct Pure values
    if (arg && arg.$kind === 'Pure') {
      if (arg.Pure && typeof arg.Pure === 'string') {
        return BigInt(arg.Pure);
      }
      if (arg.Pure && typeof arg.Pure === 'number') {
        return BigInt(arg.Pure);
      }
      if (Array.isArray(arg.Pure)) {
        // Handle byte array representation
        // eslint-disable-next-line no-bitwise
        const value = arg.Pure.reduce(
          (acc: bigint, byte: number, index: number) => acc + (BigInt(byte) << BigInt(index * 8)),
          BigInt(0),
        );
        return value;
      }
      return BigInt(arg.Pure);
    }

    if (typeof arg === 'bigint') {
      return arg;
    }

    if (typeof arg === 'number' || typeof arg === 'string') {
      return BigInt(arg);
    }

    return BigInt(0);
  }

  private extractU8Value(arg: any): number {
    // Handle Input references
    if (arg && arg.$kind === 'Input' && typeof arg.Input === 'number') {
      const inputIndex = arg.Input;
      if (this.txInputs && this.txInputs[inputIndex]) {
        const input = this.txInputs[inputIndex];

        // Handle Pure type with base64 bytes
        if (input.$kind === 'Pure' && input.Pure && input.Pure.bytes) {
          // Decode base64 bytes to get the actual value
          const bytes = Buffer.from(input.Pure.bytes, 'base64');
          return bytes.length > 0 ? bytes[0] : 0;
        }

        // Handle other input types
        if (input.type === 'pure' && input.value !== undefined) {
          return Number(input.value);
        }
        if (typeof input === 'number') {
          return input;
        }
        if (typeof input === 'string') {
          return parseInt(input, 10);
        }
      }
      return inputIndex;
    }

    // Handle direct Pure values
    if (arg && arg.$kind === 'Pure') {
      if (typeof arg.Pure === 'number') {
        return arg.Pure;
      }
      if (typeof arg.Pure === 'string') {
        return parseInt(arg.Pure, 10);
      }
      if (Array.isArray(arg.Pure) && arg.Pure.length > 0) {
        return arg.Pure[0];
      }
      return Number(arg.Pure);
    }

    if (typeof arg === 'number') {
      return arg;
    }

    if (typeof arg === 'string') {
      return parseInt(arg, 10);
    }

    return 0;
  }

  private extractBoolValue(arg: any): boolean {
    // Handle Input references
    if (arg && arg.$kind === 'Input' && typeof arg.Input === 'number') {
      const inputIndex = arg.Input;
      if (this.txInputs && this.txInputs[inputIndex]) {
        const input = this.txInputs[inputIndex];

        // Handle Pure type with base64 bytes
        if (input.$kind === 'Pure' && input.Pure && input.Pure.bytes) {
          // Decode base64 bytes to get the actual value
          const bytes = Buffer.from(input.Pure.bytes, 'base64');
          return bytes.length > 0 ? bytes[0] !== 0 : false;
        }

        // Handle other input types
        if (input.type === 'pure' && input.value !== undefined) {
          return Boolean(input.value);
        }
        if (typeof input === 'boolean') {
          return input;
        }
        if (typeof input === 'string') {
          return input.toLowerCase() === 'true';
        }
        if (typeof input === 'number') {
          return input !== 0;
        }
      }
      return inputIndex !== 0;
    }

    // Handle direct Pure values
    if (arg && arg.$kind === 'Pure') {
      if (typeof arg.Pure === 'boolean') {
        return arg.Pure;
      }
      if (typeof arg.Pure === 'string') {
        return arg.Pure.toLowerCase() === 'true';
      }
      if (typeof arg.Pure === 'number') {
        return arg.Pure !== 0;
      }
      if (Array.isArray(arg.Pure) && arg.Pure.length > 0) {
        return arg.Pure[0] !== 0;
      }
      return Boolean(arg.Pure);
    }

    if (typeof arg === 'boolean') {
      return arg;
    }

    if (typeof arg === 'string') {
      return arg.toLowerCase() === 'true';
    }

    if (typeof arg === 'number') {
      return arg !== 0;
    }

    return false;
  }

  private extractAddressValue(arg: any): string {
    if (arg && arg.$kind === 'Pure') {
      if (typeof arg.Pure === 'string') {
        return arg.Pure;
      }
      if (Array.isArray(arg.Pure)) {
        // Handle address as byte array
        return `0x${arg.Pure.map((byte: number) => byte.toString(16).padStart(2, '0')).join('')}`;
      }
      return String(arg.Pure);
    }

    if (typeof arg === 'string') {
      return arg;
    }

    return String(arg);
  }
}
