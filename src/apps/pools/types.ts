export enum TransactionSubType {
  // Liquidity Management
  ADD_LIQUIDITY = 'add-liquidity',
  REMOVE_LIQUIDITY = 'remove-liquidity',

  // Pool Creation
  INIT_POOL_CLASSIC = 'init-pool-classic',
  INIT_POOL_STABLE = 'init-pool-stable',

  // Admin Operations (require AdminCap)
  SET_GLOBAL_PAUSE_STATUS = 'set-global-pause-status',
  CLAIM_FEE = 'claim-fee',
  SET_NEW_POOL_AMPLIFICATION = 'set-new-pool-amplification',
  CHANGE_POOL_TYPE = 'change-pool-type',

  // Farming/Staking Operations
  REGISTER_POOL = 'register-pool',
  ENABLE_EMERGENCY = 'enable-emergency',
  EMERGENCY_UNSTAKE = 'emergency-unstake',
  WITHDRAW_REWARD_TO_TREASURY = 'withdraw-reward-to-treasury',
  ENABLE_GLOBAL_EMERGENCY = 'enable-global-emergency',
  SET_TREASURY_ADMIN_ADDRESS = 'set-treasury-admin-address',
  SET_EMERGENCY_ADMIN_ADDRESS = 'set-emergency-admin-address',
}
