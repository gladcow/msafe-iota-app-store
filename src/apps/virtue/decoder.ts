import { bcs } from '@iota/iota-sdk/bcs';
import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { IotaSignTransactionInput, WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';
import { Logger } from 'tslog';

import { IotaNetworks } from '@/types';

import { DecodeResult, TransactionSubType } from './types';
import {
  DepositStabilityPoolIntentionData,
  ManagePositionIntentionData,
  WithdrawStabilityPoolIntentionData,
} from './types/api';

export const logger = new Logger({ name: 'Virtue' });

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

    this.transaction = tx;

    if (this.isManagePositionTransaction()) {
      return this.decodeManagePosition();
    }

    if (this.isDepositStabilityPoolTransaction()) {
      return this.depositStabilityPool();
    }

    if (this.isWithdrawStabilityPoolTransaction()) {
      return this.withdrawStabilityPool();
    }

    throw new Error(`Unknown transaction type`);
  }

  // Store transaction inputs for value extractionAdd commentMore actions
  private transaction: Transaction;

  private txInputs: any[] = [];

  private txData: any;

  // validate function by checking function signature
  private isManagePositionTransaction() {
    return (
      !!this.getMoveCallModuleCommand('manage', 'request') &&
      !!this.getMoveCallModuleCommand('vault', 'manage_position')
    );
  }

  private isDepositStabilityPoolTransaction() {
    // TODO: typo
    return (
      !!this.getMoveCallModuleCommand('stablility_pool', 'deposit') &&
      !this.getMoveCallModuleCommand('stablility_pool', 'withdraw')
    );
  }

  private isWithdrawStabilityPoolTransaction() {
    // TODO: typo
    return (
      !!this.getMoveCallModuleCommand('stablility_pool', 'withdraw') &&
      !!this.getMoveCallModuleCommand('stablility_pool', 'withdraw')
    );
  }

  // utils functions
  private get inputs() {
    return this.transaction.getData().inputs;
  }

  private get commands() {
    return this.transaction.getData().commands.map((c, index) => ({ ...c, index }));
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private getSplitCoinsCommands() {
    return this.commands.filter((command) => command.$kind === 'SplitCoins');
  }

  private GetTransferObjectsCommands() {
    return this.commands.filter((command) => command.$kind === 'TransferObjects');
  }

  private getZeroCoinsCommands() {
    return this.commands.filter(
      (command) =>
        command.$kind === 'MoveCall' && command.MoveCall.module === 'coin' && command.MoveCall.function === 'zero',
    );
  }

  private getMoveCallModuleCommand(module: string, fn: string) {
    return this.commands.find(
      (command) =>
        command.$kind === 'MoveCall' && command.MoveCall.module === module && command.MoveCall.function === fn,
    );
  }

  private getPureInputU64(idx: number) {
    const input = this.inputs[idx];
    if (input.$kind !== 'Pure') {
      throw new Error('not pure argument');
    }

    return bcs.U64.fromBase64(input.Pure.bytes);
  }

  private getPureInputAddress(idx: number) {
    const input = this.inputs[idx];
    if (input.$kind !== 'Pure') {
      throw new Error('not pure argument');
    }

    return bcs.Address.fromBase64(input.Pure.bytes);
  }

  // decode transactions
  private decodeManagePosition(): DecodeResult {
    const intentionData = {
      collateralType: '',
      collateralAmount: '',
      borrowAmount: '',
      repaymentAmount: '',
      withdrawAmount: '',
    } as ManagePositionIntentionData;

    const requestManagePositionCommand = this.getMoveCallModuleCommand('manage', 'request');
    const splitCoinsCommands = this.getSplitCoinsCommands().filter((c) => c.index < requestManagePositionCommand.index);
    const zeroCoinsCommands = this.getZeroCoinsCommands().filter((c) => c.index < requestManagePositionCommand.index);

    if (
      !(
        splitCoinsCommands.length === 2 ||
        zeroCoinsCommands.length === 2 ||
        (splitCoinsCommands.length === 1 && zeroCoinsCommands.length === 1)
      )
    ) {
      throw Error('Unhandled Transaction');
    }

    // find "collateralAmount & repaymentAmount" from getInputCoin command
    // both coins come from SplitCoins
    if (splitCoinsCommands.length === 2) {
      const sortedSplitCoinsCommands = splitCoinsCommands.sort((a, b) => a.index - b.index);
      if (sortedSplitCoinsCommands[0].$kind === 'SplitCoins') {
        const inputCoinObject = sortedSplitCoinsCommands[0].SplitCoins.amounts[0];
        if (inputCoinObject.$kind === 'Input') {
          intentionData.collateralAmount = this.getPureInputU64(inputCoinObject.Input);
        }
      }

      if (sortedSplitCoinsCommands[1].$kind === 'SplitCoins') {
        const inputCoinObject = sortedSplitCoinsCommands[0].SplitCoins.amounts[1];
        if (inputCoinObject.$kind === 'Input') {
          intentionData.repaymentAmount = this.getPureInputU64(inputCoinObject.Input);
        }
      }
    } else if (zeroCoinsCommands.length === 2) {
      // both coins come from coinZero command
      const sortedZeroCommands = zeroCoinsCommands.sort((a, b) => a.index - b.index);
      if (sortedZeroCommands[0].$kind === 'MoveCall') {
        if (sortedZeroCommands[0].MoveCall.module === 'coin' && sortedZeroCommands[0].MoveCall.function === 'zero') {
          intentionData.collateralAmount = '0';
        }
      }

      if (sortedZeroCommands[1].$kind === 'MoveCall') {
        if (sortedZeroCommands[1].MoveCall.module === 'coin' && sortedZeroCommands[1].MoveCall.function === 'zero') {
          intentionData.repaymentAmount = '0';
        }
      }
    } else {
      // when we have single zeroCoinsCommands & splitCoinsCommands respectively
      const zeroCoinsCommand = zeroCoinsCommands[0];
      const splitCoinsCommand = splitCoinsCommands[0];

      if (zeroCoinsCommand.index < splitCoinsCommand.index) {
        // [collateralAmount, repaymentAmount] = [zeroCoinsCommand, splitCoinsCommand]
        // collateralAmount
        if (
          zeroCoinsCommand.$kind === 'MoveCall' &&
          zeroCoinsCommand.MoveCall.module === 'coin' &&
          zeroCoinsCommand.MoveCall.function === 'zero'
        ) {
          intentionData.collateralAmount = '0';
        }
        // repaymentAmount
        if (splitCoinsCommand.$kind === 'SplitCoins') {
          const repaymentAmount = splitCoinsCommand.SplitCoins.amounts[0];
          if (repaymentAmount.$kind === 'Input') {
            intentionData.repaymentAmount = this.getPureInputU64(repaymentAmount.Input);
          }
        }
      } else {
        // [collateralAmount, repaymentAmount] = [splitCoinsCommand, zeroCoinsCommand]
        // collateralAmount
        if (splitCoinsCommand.$kind === 'SplitCoins') {
          const collateralAmount = splitCoinsCommand.SplitCoins.amounts[0];
          if (collateralAmount.$kind === 'Input') {
            intentionData.collateralAmount = this.getPureInputU64(collateralAmount.Input);
          }
        }
        // repaymentAmount
        if (
          zeroCoinsCommand.$kind === 'MoveCall' &&
          zeroCoinsCommand.MoveCall.module === 'coin' &&
          zeroCoinsCommand.MoveCall.function === 'zero'
        ) {
          intentionData.repaymentAmount = '0';
        }
      }
    }

    // collateralType
    const collateralType = requestManagePositionCommand.MoveCall.typeArguments[0];
    intentionData.collateralType = collateralType;

    // borrowAmount
    const borrowAmountArgument = requestManagePositionCommand.MoveCall.arguments[3];
    if (borrowAmountArgument.$kind === 'Input') {
      intentionData.borrowAmount = this.getPureInputU64(borrowAmountArgument.Input);
    }
    // withdrawAmount
    const withdrawAmountArgument = requestManagePositionCommand.MoveCall.arguments[5];
    if (withdrawAmountArgument.$kind === 'Input') {
      intentionData.withdrawAmount = this.getPureInputU64(withdrawAmountArgument.Input);
    }

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.ManagePosition,
      intentionData,
    };
  }

  private depositStabilityPool(): DecodeResult {
    const intentionData = {
      vusdAmount: '',
      recipient: undefined,
    } as DepositStabilityPoolIntentionData;

    const splitCoinsCommands = this.getSplitCoinsCommands();

    if (splitCoinsCommands.length !== 1) {
      throw Error('Unhandled transaction');
    }

    // vusdAmount
    const splitCoinsCommand = splitCoinsCommands[0];
    if (splitCoinsCommand.$kind === 'SplitCoins') {
      const vusdAmount = splitCoinsCommand.SplitCoins.amounts[0];
      if (vusdAmount.$kind === 'Input') {
        intentionData.vusdAmount = this.getPureInputU64(vusdAmount.Input);
      }
    }

    // recipient
    const transferObjectsCommands = this.GetTransferObjectsCommands();
    if (transferObjectsCommands.length !== 1) {
      throw Error('Unhandled transaction');
    }

    const transferObjectsCommand = transferObjectsCommands[0];
    if (transferObjectsCommand.$kind === 'TransferObjects') {
      const recipient = transferObjectsCommand.TransferObjects.address;
      if (recipient.$kind === 'Input') {
        intentionData.recipient = this.getPureInputAddress(recipient.Input);
      }
    }

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.DepositStabilityPool,
      intentionData,
    };
  }

  private withdrawStabilityPool(): DecodeResult {
    const intentionData = {
      vusdAmount: '',
      recipient: undefined,
    } as WithdrawStabilityPoolIntentionData;

    const splitCoinsCommands = this.getSplitCoinsCommands();

    if (splitCoinsCommands.length !== 1) {
      throw Error('Unhandled transaction');
    }

    // vusdAmount
    const splitCoinsCommand = splitCoinsCommands[0];
    if (splitCoinsCommand.$kind === 'SplitCoins') {
      const vusdAmount = splitCoinsCommand.SplitCoins.amounts[0];
      if (vusdAmount.$kind === 'Input') {
        intentionData.vusdAmount = this.getPureInputU64(vusdAmount.Input);
      }
    }

    // recipient
    const transferObjectsCommands = this.GetTransferObjectsCommands();
    if (transferObjectsCommands.length !== 1) {
      throw Error('Unhandled transaction');
    }

    const transferObjectsCommand = transferObjectsCommands[0];
    if (transferObjectsCommand.$kind === 'TransferObjects') {
      const recipient = transferObjectsCommand.TransferObjects.address;
      if (recipient.$kind === 'Input') {
        intentionData.recipient = this.getPureInputAddress(recipient.Input);
      }
    }

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.WithdrawStabilityPool,
      intentionData,
    };
  }
}
