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
    const { transaction, client } = this.input;

    const txContent = await transaction.toJSON();
    const tx = Transaction.from(txContent);

    const txData = tx.getData();

    if (this.isAddLiquidityTransaction(txData)) {
      return this.decodeAddLiquidity(txData);
    }

    if (this.isRemoveLiquidityTransaction(txData)) {
      return this.decodeRemoveLiquidity(txData);
    }

    throw new Error('Unknown transaction type');
  }

  private isAddLiquidityTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.poolEntry, config.addLiquidityMethod);
  }

  private isRemoveLiquidityTransaction(txData: any): boolean {
    return this.hasMoveCallWithTarget(txData, config.moduleId, config.poolEntry, config.removeLiquidityMethod);
  }

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

  private extractObjectId(arg: any): string {
    if (arg && arg.$kind === 'Input' && typeof arg.Input === 'number') {
      return arg.Input.toString();
    }

    if (arg && typeof arg === 'object' && arg.objectId) {
      return arg.objectId;
    }

    if (typeof arg === 'string') {
      return arg;
    }

    return String(arg);
  }

  private extractU64Value(arg: any): bigint {
    if (arg && arg.$kind === 'Pure') {
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
}
