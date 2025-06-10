import {
  BorrowIntentionData,
  CloseIntentionData,
  RepayIntentionData,
  WithdrawIntentionData,
  TankDepositIntentionData,
  TankWithdrawIntentionData,
} from '@/apps/virtue/types/api';

export type VirtueIntentionData =
  | BorrowIntentionData
  | WithdrawIntentionData
  | RepayIntentionData
  | CloseIntentionData
  | TankDepositIntentionData
  | TankWithdrawIntentionData;
