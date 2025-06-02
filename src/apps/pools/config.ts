const config = {
  // Package information - usar una dirección válida de 32 bytes
  moduleId: '0x0000000000000000000000000000000000000000000000000000000000000001',

  // Module entries
  poolEntry: 'amm_entries',
  stakeEntry: 'stake_entries',

  // Liquidity management methods
  addLiquidityMethod: 'add_liquidity',
  removeLiquidityMethod: 'remove_liquidity',

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
  pauseStatusId: '0x0000000000000000000000000000000000000000000000000000000000000002',
  globalCreatedPoolsId: '0x0000000000000000000000000000000000000000000000000000000000000003',
  globalConfigId: '0x0000000000000000000000000000000000000000000000000000000000000004',
  clockId: '0x6',
};

export default config;
