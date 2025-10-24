import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Trading
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tradingAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_initialOwner', internalType: 'address', type: 'address' },
      { name: '_evvmAddress', internalType: 'address', type: 'address' },
      { name: '_treasuryAddress', internalType: 'address', type: 'address' },
      { name: '_nameServiceAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'BASIS_POINTS_DIVISOR',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'FEE_BASIS_POINTS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'STAKER_DISCOUNT_PERCENT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_caip10Wallet', internalType: 'string', type: 'string' },
      { name: '_nonce', internalType: 'uint256', type: 'uint256' },
      { name: '_signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'cancelOrder',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelOwnershipHandover',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pendingOwner', internalType: 'address', type: 'address' },
    ],
    name: 'completeOwnershipHandover',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_caip10Token', internalType: 'string', type: 'string' },
      { name: '_caip10Wallet', internalType: 'string', type: 'string' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: '_action', internalType: 'enum Trading.ActionIs', type: 'uint8' },
      { name: '_depositorWallet', internalType: 'address', type: 'address' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'caip10Wallet', internalType: 'string', type: 'string' },
      { name: 'caip10Token', internalType: 'string', type: 'string' },
    ],
    name: 'depositorInfo',
    outputs: [
      { name: 'evmDepositorWallet', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'evvmAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_caip10Wallet', internalType: 'string', type: 'string' },
      { name: '_caip10Token', internalType: 'string', type: 'string' },
    ],
    name: 'getDepositor',
    outputs: [{ name: 'depositor', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: '_caip10Wallet', internalType: 'string', type: 'string' },
      { name: '_caip10Token', internalType: 'string', type: 'string' },
    ],
    name: 'getFeeInfo',
    outputs: [
      { name: 'fee', internalType: 'uint256', type: 'uint256' },
      { name: 'netAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'isStaker', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_caip10Wallet', internalType: 'string', type: 'string' },
      { name: '_caip10Token', internalType: 'string', type: 'string' },
    ],
    name: 'getTradeBalance',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nameServiceAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'caip10Wallet', internalType: 'string', type: 'string' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'orderNonces',
    outputs: [{ name: 'used', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: 'result', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pendingOwner', internalType: 'address', type: 'address' },
    ],
    name: 'ownershipHandoverExpiresAt',
    outputs: [{ name: 'result', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'requestOwnershipHandover',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_data',
        internalType: 'struct Trading.SyncUpArguments[]',
        type: 'tuple[]',
        components: [
          { name: 'caip10Wallet', internalType: 'string', type: 'string' },
          { name: 'caip10Token', internalType: 'string', type: 'string' },
          {
            name: 'evmDepositorWallet',
            internalType: 'address',
            type: 'address',
          },
          { name: 'newAmount', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'syncUp',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasuryAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_caip10Token', internalType: 'string', type: 'string' },
      { name: '_caip10WalletOrName', internalType: 'string', type: 'string' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: '_action', internalType: 'enum Trading.ActionIs', type: 'uint8' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'caip10Wallet',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'caip10Token',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'evmDepositorAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'caip10Wallet',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'caip10Token',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'feeAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'isStaker', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'FeeCollected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newInfo',
        internalType: 'struct Trading.SyncUpArguments[]',
        type: 'tuple[]',
        components: [
          { name: 'caip10Wallet', internalType: 'string', type: 'string' },
          { name: 'caip10Token', internalType: 'string', type: 'string' },
          {
            name: 'evmDepositorWallet',
            internalType: 'address',
            type: 'address',
          },
          { name: 'newAmount', internalType: 'uint256', type: 'uint256' },
        ],
        indexed: false,
      },
    ],
    name: 'NewSyncUp',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'caip10Wallet',
        internalType: 'string',
        type: 'string',
        indexed: true,
      },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'OrderCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pendingOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipHandoverCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pendingOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipHandoverRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'caip10Wallet',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'caip10Token',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'evmDepositorAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Withdraw',
  },
  { type: 'error', inputs: [], name: 'AlreadyInitialized' },
  {
    type: 'error',
    inputs: [
      { name: 'have', internalType: 'uint256', type: 'uint256' },
      { name: 'want', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'CANT_WITHDRAW_MORE_THAN_ACCOUNT_HAVE',
  },
  { type: 'error', inputs: [], name: 'INVALID_SIGNATURE' },
  { type: 'error', inputs: [], name: 'InvalidAddress' },
  { type: 'error', inputs: [], name: 'InvalidCaip10Format' },
  { type: 'error', inputs: [], name: 'NewOwnerIsZeroAddress' },
  { type: 'error', inputs: [], name: 'NoHandoverRequest' },
  { type: 'error', inputs: [], name: 'NotEvmChain' },
  { type: 'error', inputs: [], name: 'StringsInvalidAddressFormat' },
  { type: 'error', inputs: [], name: 'Unauthorized' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'YOURE_NOT_THE_OWNER_OF_THE_ACCOUNT',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__
 */
export const useReadTrading = /*#__PURE__*/ createUseReadContract({
  abi: tradingAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"BASIS_POINTS_DIVISOR"`
 */
export const useReadTradingBasisPointsDivisor =
  /*#__PURE__*/ createUseReadContract({
    abi: tradingAbi,
    functionName: 'BASIS_POINTS_DIVISOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"FEE_BASIS_POINTS"`
 */
export const useReadTradingFeeBasisPoints = /*#__PURE__*/ createUseReadContract(
  { abi: tradingAbi, functionName: 'FEE_BASIS_POINTS' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"STAKER_DISCOUNT_PERCENT"`
 */
export const useReadTradingStakerDiscountPercent =
  /*#__PURE__*/ createUseReadContract({
    abi: tradingAbi,
    functionName: 'STAKER_DISCOUNT_PERCENT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"depositorInfo"`
 */
export const useReadTradingDepositorInfo = /*#__PURE__*/ createUseReadContract({
  abi: tradingAbi,
  functionName: 'depositorInfo',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"evvmAddress"`
 */
export const useReadTradingEvvmAddress = /*#__PURE__*/ createUseReadContract({
  abi: tradingAbi,
  functionName: 'evvmAddress',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"getDepositor"`
 */
export const useReadTradingGetDepositor = /*#__PURE__*/ createUseReadContract({
  abi: tradingAbi,
  functionName: 'getDepositor',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"getFeeInfo"`
 */
export const useReadTradingGetFeeInfo = /*#__PURE__*/ createUseReadContract({
  abi: tradingAbi,
  functionName: 'getFeeInfo',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"getTradeBalance"`
 */
export const useReadTradingGetTradeBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: tradingAbi,
    functionName: 'getTradeBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"nameServiceAddress"`
 */
export const useReadTradingNameServiceAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: tradingAbi,
    functionName: 'nameServiceAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"orderNonces"`
 */
export const useReadTradingOrderNonces = /*#__PURE__*/ createUseReadContract({
  abi: tradingAbi,
  functionName: 'orderNonces',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"owner"`
 */
export const useReadTradingOwner = /*#__PURE__*/ createUseReadContract({
  abi: tradingAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"ownershipHandoverExpiresAt"`
 */
export const useReadTradingOwnershipHandoverExpiresAt =
  /*#__PURE__*/ createUseReadContract({
    abi: tradingAbi,
    functionName: 'ownershipHandoverExpiresAt',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"treasuryAddress"`
 */
export const useReadTradingTreasuryAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: tradingAbi,
    functionName: 'treasuryAddress',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tradingAbi}__
 */
export const useWriteTrading = /*#__PURE__*/ createUseWriteContract({
  abi: tradingAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"cancelOrder"`
 */
export const useWriteTradingCancelOrder = /*#__PURE__*/ createUseWriteContract({
  abi: tradingAbi,
  functionName: 'cancelOrder',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"cancelOwnershipHandover"`
 */
export const useWriteTradingCancelOwnershipHandover =
  /*#__PURE__*/ createUseWriteContract({
    abi: tradingAbi,
    functionName: 'cancelOwnershipHandover',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"completeOwnershipHandover"`
 */
export const useWriteTradingCompleteOwnershipHandover =
  /*#__PURE__*/ createUseWriteContract({
    abi: tradingAbi,
    functionName: 'completeOwnershipHandover',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteTradingDeposit = /*#__PURE__*/ createUseWriteContract({
  abi: tradingAbi,
  functionName: 'deposit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteTradingRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: tradingAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"requestOwnershipHandover"`
 */
export const useWriteTradingRequestOwnershipHandover =
  /*#__PURE__*/ createUseWriteContract({
    abi: tradingAbi,
    functionName: 'requestOwnershipHandover',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"syncUp"`
 */
export const useWriteTradingSyncUp = /*#__PURE__*/ createUseWriteContract({
  abi: tradingAbi,
  functionName: 'syncUp',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteTradingTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: tradingAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteTradingWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: tradingAbi,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tradingAbi}__
 */
export const useSimulateTrading = /*#__PURE__*/ createUseSimulateContract({
  abi: tradingAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"cancelOrder"`
 */
export const useSimulateTradingCancelOrder =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tradingAbi,
    functionName: 'cancelOrder',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"cancelOwnershipHandover"`
 */
export const useSimulateTradingCancelOwnershipHandover =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tradingAbi,
    functionName: 'cancelOwnershipHandover',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"completeOwnershipHandover"`
 */
export const useSimulateTradingCompleteOwnershipHandover =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tradingAbi,
    functionName: 'completeOwnershipHandover',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateTradingDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tradingAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateTradingRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tradingAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"requestOwnershipHandover"`
 */
export const useSimulateTradingRequestOwnershipHandover =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tradingAbi,
    functionName: 'requestOwnershipHandover',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"syncUp"`
 */
export const useSimulateTradingSyncUp = /*#__PURE__*/ createUseSimulateContract(
  { abi: tradingAbi, functionName: 'syncUp' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateTradingTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tradingAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tradingAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateTradingWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tradingAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tradingAbi}__
 */
export const useWatchTradingEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: tradingAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tradingAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchTradingDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tradingAbi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tradingAbi}__ and `eventName` set to `"FeeCollected"`
 */
export const useWatchTradingFeeCollectedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tradingAbi,
    eventName: 'FeeCollected',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tradingAbi}__ and `eventName` set to `"NewSyncUp"`
 */
export const useWatchTradingNewSyncUpEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tradingAbi,
    eventName: 'NewSyncUp',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tradingAbi}__ and `eventName` set to `"OrderCancelled"`
 */
export const useWatchTradingOrderCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tradingAbi,
    eventName: 'OrderCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tradingAbi}__ and `eventName` set to `"OwnershipHandoverCanceled"`
 */
export const useWatchTradingOwnershipHandoverCanceledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tradingAbi,
    eventName: 'OwnershipHandoverCanceled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tradingAbi}__ and `eventName` set to `"OwnershipHandoverRequested"`
 */
export const useWatchTradingOwnershipHandoverRequestedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tradingAbi,
    eventName: 'OwnershipHandoverRequested',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tradingAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchTradingOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tradingAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tradingAbi}__ and `eventName` set to `"Withdraw"`
 */
export const useWatchTradingWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tradingAbi,
    eventName: 'Withdraw',
  })
