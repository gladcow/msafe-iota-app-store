export interface ManagePositionIntentionData {
  collateralType: string;
  collateralAmount: string;
  borrowAmount: string;
  repaymentAmount: string;
  withdrawAmount: string;
}

export interface DepositStabilityPoolIntentionData {
  vusdAmount: string;
  recipient?: string;
}

export interface WithdrawStabilityPoolIntentionData {
  vusdAmount: string;
  recipient?: string;
}
