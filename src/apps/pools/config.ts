const config = {
  // Package information
  moduleId: '0x8f59ae4ad83043ba2aac7c7680d4fd48402df4371b73a81ea69abd4b1d2a6e23',

  // Module entries
  poolEntry: 'amm_entries',
  stakeEntry: 'stake_entries',

  // Liquidity management methods
  addLiquidityMethod: 'add_liquidity',
  removeLiquidityMethod: 'remove_liquidity',

  // Swap methods
  swapExactCoinAForCoinBMethod: 'swap_exact_coinA_for_coinB',
  swapExactCoinBForCoinAMethod: 'swap_exact_coinB_for_coinA',
  swapCoinAForExactCoinBMethod: 'swap_coinA_for_exact_coinB',
  swapCoinBForExactCoinAMethod: 'swap_coinB_for_exact_coinA',

  // Pool creation methods
  initPoolClassicMethod: 'init_pool_classic',
  initPoolStableMethod: 'init_pool_stable',

  // Admin methods (require AdminCap)
  setGlobalPauseStatusMethod: 'set_global_pause_status',
  claimFeeMethod: 'claim_fee',
  setNewPoolAmplificationMethod: 'set_new_pool_amplification_p',
  changePoolTypeMethod: 'change_pool_type',

  // Farming/Staking methods
  registerPoolMethod: 'register_pool',

  // Emergency methods
  enableEmergencyMethod: 'enable_emergency',
  emergencyUnstakeMethod: 'emergency_unstake',
  enableGlobalEmergencyMethod: 'enable_global_emergency',

  // Treasury/Admin methods
  withdrawRewardToTreasuryMethod: 'withdraw_reward_to_treasury',
  setTreasuryAdminAddressMethod: 'set_treasury_admin_address',
  setEmergencyAdminAddressMethod: 'set_emergency_admin_address',

  // Global objects and shared resources
  pauseStatusId: '0xe7d07303dfdd724d6eaed34f9ee7bda1e9559faa80b44f7db9cf302cffad17b8',
  globalCreatedPoolsId: '0xa5ade62668e8501a71b60ebccde066427bc8c4c46741c589e3dc2492e27db57d',
  globalConfigId: '0xba6c1429b8457a57f4d5851d470168346814097a87d9e469c1a481a672e54b87',
  clockId: '0x6',
};

export default config;
