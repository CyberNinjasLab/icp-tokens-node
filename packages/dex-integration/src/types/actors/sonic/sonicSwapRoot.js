export const idlFactory = ({ IDL }) => {
  const TxReceipt = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const TokenBlockType = IDL.Variant({
    'Full' : IDL.Bool,
    'None' : IDL.Bool,
    'Partial' : IDL.Bool,
  });
  const ValidateFunctionReturnType = IDL.Variant({
    'Ok' : IDL.Text,
    'Err' : IDL.Text,
  });
  const WithdrawState = IDL.Record({
    'tokenId' : IDL.Text,
    'refundStatus' : IDL.Bool,
    'value' : IDL.Nat,
    'userPId' : IDL.Principal,
  });
  const TokenInfoExt = IDL.Record({
    'id' : IDL.Text,
    'fee' : IDL.Nat,
    'decimals' : IDL.Nat8,
    'name' : IDL.Text,
    'totalSupply' : IDL.Nat,
    'symbol' : IDL.Text,
  });
  const PairInfoExt = IDL.Record({
    'id' : IDL.Text,
    'price0CumulativeLast' : IDL.Nat,
    'creator' : IDL.Principal,
    'reserve0' : IDL.Nat,
    'reserve1' : IDL.Nat,
    'lptoken' : IDL.Text,
    'totalSupply' : IDL.Nat,
    'token0' : IDL.Text,
    'token1' : IDL.Text,
    'price1CumulativeLast' : IDL.Nat,
    'kLast' : IDL.Nat,
    'blockTimestampLast' : IDL.Int,
  });
  const RewardInfo = IDL.Record({ 'tokenId' : IDL.Text, 'amount' : IDL.Nat });
  const Time = IDL.Int;
  const DepositSubAccounts = IDL.Record({
    'depositAId' : IDL.Text,
    'subaccount' : IDL.Vec(IDL.Nat8),
    'created_at' : Time,
    'transactionOwner' : IDL.Principal,
  });
  const SwapInfoExt = IDL.Record({
    'owner' : IDL.Principal,
    'txcounter' : IDL.Nat,
    'depositCounter' : IDL.Nat,
    'feeOn' : IDL.Bool,
    'feeTo' : IDL.Principal,
  });
  const WithdrawRefundReceipt = IDL.Variant({
    'Ok' : IDL.Bool,
    'Err' : IDL.Text,
  });
  const CapDetails = IDL.Record({
    'CapV2RootBucketId' : IDL.Opt(IDL.Text),
    'CapV1Status' : IDL.Bool,
    'CapV2Status' : IDL.Bool,
    'CapV1RootBucketId' : IDL.Opt(IDL.Text),
  });
  const ICRC1SubAccountBalance = IDL.Variant({
    'ok' : IDL.Nat,
    'err' : IDL.Text,
  });
  const SwapLastTransaction = IDL.Variant({
    'RemoveLiquidityOutAmount' : IDL.Tuple(IDL.Nat, IDL.Nat),
    'SwapOutAmount' : IDL.Nat,
    'NotFound' : IDL.Bool,
  });
  const TokenInfoWithType = IDL.Record({
    'id' : IDL.Text,
    'fee' : IDL.Nat,
    'decimals' : IDL.Nat8,
    'name' : IDL.Text,
    'totalSupply' : IDL.Nat,
    'blockStatus' : IDL.Text,
    'tokenType' : IDL.Text,
    'symbol' : IDL.Text,
  });
  const SwapInfo = IDL.Record({
    'owner' : IDL.Principal,
    'cycles' : IDL.Nat,
    'tokens' : IDL.Vec(TokenInfoExt),
    'pairs' : IDL.Vec(PairInfoExt),
    'commitId' : IDL.Text,
    'feeOn' : IDL.Bool,
    'feeTo' : IDL.Principal,
  });
  const TokenAnalyticsInfo = IDL.Record({
    'fee' : IDL.Nat,
    'decimals' : IDL.Nat8,
    'name' : IDL.Text,
    'totalSupply' : IDL.Nat,
    'symbol' : IDL.Text,
  });
  const UserInfo = IDL.Record({
    'lpBalances' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
    'balances' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
  });
  const UserInfoPage = IDL.Record({
    'lpBalances' : IDL.Tuple(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)), IDL.Nat),
    'balances' : IDL.Tuple(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)), IDL.Nat),
  });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Tuple(IDL.Nat, IDL.Nat),
    'err' : IDL.Text,
  });
  const ICRCTxReceipt = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Nat8),
    'Err' : IDL.Text,
  });
  const Status = IDL.Variant({
    'stopped' : IDL.Null,
    'stopping' : IDL.Null,
    'running' : IDL.Null,
  });
  const CanisterSettings = IDL.Record({
    'freezing_threshold' : IDL.Opt(IDL.Nat),
    'controllers' : IDL.Opt(IDL.Vec(IDL.Principal)),
    'memory_allocation' : IDL.Opt(IDL.Nat),
    'compute_allocation' : IDL.Opt(IDL.Nat),
  });
  const CanisterStatus = IDL.Record({
    'status' : Status,
    'memory_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'settings' : CanisterSettings,
    'module_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const MonitorMetrics = IDL.Record({
    'tokenBalancesSize' : IDL.Nat,
    'canisterStatus' : CanisterStatus,
    'blocklistedUsersCount' : IDL.Nat,
    'rewardTokensSize' : IDL.Nat,
    'lptokensSize' : IDL.Nat,
    'cycles' : IDL.Nat,
    'tokenAllowanceSize' : IDL.Nat,
    'rewardInfo' : IDL.Nat,
    'lpTokenAllowanceSize' : IDL.Nat,
    'rewardPairsSize' : IDL.Nat,
    'tokenCount' : IDL.Nat,
    'lpTokenBalancesSize' : IDL.Nat,
    'pairsCount' : IDL.Nat,
    'depositTransactionSize' : IDL.Nat,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Bool, 'err' : IDL.Text });
  return IDL.Service({
    'addAuth' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'addLiquidity' : IDL.Func(
        [
          IDL.Principal,
          IDL.Principal,
          IDL.Nat,
          IDL.Nat,
          IDL.Nat,
          IDL.Nat,
          IDL.Int,
        ],
        [TxReceipt],
        [],
      ),
    'addLiquidityForUser' : IDL.Func(
        [
          IDL.Principal,
          IDL.Principal,
          IDL.Principal,
          IDL.Nat,
          IDL.Nat,
          IDL.Bool,
        ],
        [TxReceipt],
        [],
      ),
    'addLiquidityForUserTest' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Principal, IDL.Nat, IDL.Nat],
        [IDL.Text],
        [],
      ),
    'addNatLabsToken' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'addPairToBlocklist' : IDL.Func(
        [IDL.Principal, IDL.Principal, TokenBlockType],
        [IDL.Bool],
        [],
      ),
    'addToken' : IDL.Func([IDL.Principal, IDL.Text], [TxReceipt], []),
    'addTokenToBlocklist' : IDL.Func(
        [IDL.Principal, TokenBlockType],
        [IDL.Bool],
        [],
      ),
    'addTokenToBlocklistValidate' : IDL.Func(
        [IDL.Principal, TokenBlockType],
        [ValidateFunctionReturnType],
        [],
      ),
    'addTokenValidate' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [ValidateFunctionReturnType],
        [],
      ),
    'addUserToBlocklist' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'allowance' : IDL.Func(
        [IDL.Text, IDL.Principal, IDL.Principal],
        [IDL.Nat],
        ['query'],
      ),
    'approve' : IDL.Func([IDL.Text, IDL.Principal, IDL.Nat], [IDL.Bool], []),
    'balanceOf' : IDL.Func([IDL.Text, IDL.Principal], [IDL.Nat], ['query']),
    'burn' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    'createPair' : IDL.Func([IDL.Principal, IDL.Principal], [TxReceipt], []),
    'decimals' : IDL.Func([IDL.Text], [IDL.Nat8], ['query']),
    'deposit' : IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'depositTo' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [TxReceipt],
        [],
      ),
    'executeFundRecoveryForUser' : IDL.Func([IDL.Principal], [TxReceipt], []),
    'exportBalances' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat)))],
        ['query'],
      ),
    'exportFaileWithdraws' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, WithdrawState))],
        ['query'],
      ),
    'exportLPTokens' : IDL.Func([], [IDL.Vec(TokenInfoExt)], ['query']),
    'exportPairs' : IDL.Func([], [IDL.Vec(PairInfoExt)], ['query']),
    'exportRewardInfo' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(RewardInfo)))],
        ['query'],
      ),
    'exportRewardPairs' : IDL.Func([], [IDL.Vec(PairInfoExt)], ['query']),
    'exportSubAccounts' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, DepositSubAccounts))],
        ['query'],
      ),
    'exportSwapInfo' : IDL.Func([], [SwapInfoExt], ['query']),
    'exportTokenTypes' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
        ['query'],
      ),
    'exportTokens' : IDL.Func([], [IDL.Vec(TokenInfoExt)], ['query']),
    'failedWithdrawRefund' : IDL.Func([IDL.Text], [WithdrawRefundReceipt], []),
    'getAllPairs' : IDL.Func([], [IDL.Vec(PairInfoExt)], ['query']),
    'getAllRewardPairs' : IDL.Func([], [IDL.Vec(PairInfoExt)], ['query']),
    'getAuthList' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Bool))],
        ['query'],
      ),
    'getBlockedPairs' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, TokenBlockType))],
        [],
      ),
    'getBlockedTokens' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, TokenBlockType))],
        [],
      ),
    'getBlocklistedUsers' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Bool))],
        [],
      ),
    'getCapDetails' : IDL.Func([], [CapDetails], ['query']),
    'getHolderInfo' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))],
        ['query'],
      ),
    'getHolders' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getICRC1SubAccountBalance' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [ICRC1SubAccountBalance],
        [],
      ),
    'getLPTokenId' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Text],
        ['query'],
      ),
    'getLastTransactionOutAmount' : IDL.Func(
        [],
        [SwapLastTransaction],
        ['query'],
      ),
    'getNatLabsToken' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Bool))],
        [],
      ),
    'getNumPairs' : IDL.Func([], [IDL.Nat], ['query']),
    'getPair' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Opt(PairInfoExt)],
        ['query'],
      ),
    'getPairs' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(PairInfoExt), IDL.Nat],
        ['query'],
      ),
    'getSupportedTokenList' : IDL.Func(
        [],
        [IDL.Vec(TokenInfoWithType)],
        ['query'],
      ),
    'getSupportedTokenListByName' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Nat],
        [IDL.Vec(TokenInfoExt), IDL.Nat],
        ['query'],
      ),
    'getSupportedTokenListSome' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(TokenInfoExt), IDL.Nat],
        ['query'],
      ),
    'getSwapInfo' : IDL.Func([], [SwapInfo], ['query']),
    'getTokenMetadata' : IDL.Func([IDL.Text], [TokenAnalyticsInfo], ['query']),
    'getUserBalances' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        ['query'],
      ),
    'getUserICRC1SubAccount' : IDL.Func([IDL.Principal], [IDL.Text], []),
    'getUserInfo' : IDL.Func([IDL.Principal], [UserInfo], ['query']),
    'getUserInfoAbove' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Nat],
        [UserInfo],
        ['query'],
      ),
    'getUserInfoByNamePageAbove' : IDL.Func(
        [
          IDL.Principal,
          IDL.Int,
          IDL.Text,
          IDL.Nat,
          IDL.Nat,
          IDL.Int,
          IDL.Text,
          IDL.Nat,
          IDL.Nat,
        ],
        [UserInfoPage],
        ['query'],
      ),
    'getUserLPBalances' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        ['query'],
      ),
    'getUserLPBalancesAbove' : IDL.Func(
        [IDL.Principal, IDL.Nat],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        ['query'],
      ),
    'getUserReward' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Text],
        [Result_1],
        ['query'],
      ),
    'getWICPMigration' : IDL.Func([], [IDL.Bool], ['query']),
    'historySize' : IDL.Func([], [IDL.Nat], ['query']),
    'initiateICRC1Transfer' : IDL.Func([], [IDL.Vec(IDL.Nat8)], []),
    'initiateICRC1TransferForUser' : IDL.Func(
        [IDL.Principal],
        [ICRCTxReceipt],
        [],
      ),
    'log_test' : IDL.Func([], [TxReceipt], []),
    'log_test_ignore' : IDL.Func([], [TxReceipt], []),
    'migrateLiquidity' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Principal, IDL.Principal],
        [TxReceipt],
        [],
      ),
    'monitorMetrics' : IDL.Func([], [MonitorMetrics], []),
    'name' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'registerFundRecoveryForUser' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [TxReceipt],
        [],
      ),
    'removeAuth' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'removeLiquidity' : IDL.Func(
        [
          IDL.Principal,
          IDL.Principal,
          IDL.Nat,
          IDL.Nat,
          IDL.Nat,
          IDL.Principal,
          IDL.Int,
        ],
        [TxReceipt],
        [],
      ),
    'removeNatLabsToken' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'removePairFromBlocklist' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Bool],
        [],
      ),
    'removeTokenFromBlocklist' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'removeTokenFromBlocklistValidate' : IDL.Func(
        [IDL.Principal],
        [ValidateFunctionReturnType],
        [],
      ),
    'removeUserFromBlocklist' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'retryDeposit' : IDL.Func([IDL.Principal], [TxReceipt], []),
    'retryDepositTo' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [TxReceipt],
        [],
      ),
    'setCapV1EnableStatus' : IDL.Func([IDL.Bool], [IDL.Bool], []),
    'setCapV2CanisterId' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'setCapV2EnableStatus' : IDL.Func([IDL.Bool], [Result], []),
    'setFeeForToken' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    'setFeeOn' : IDL.Func([IDL.Bool], [IDL.Bool], []),
    'setFeeTo' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'setGlobalTokenFee' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'setMaxTokenValidate' : IDL.Func(
        [IDL.Nat],
        [ValidateFunctionReturnType],
        [],
      ),
    'setMaxTokens' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'setOwner' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'setWICPMigration' : IDL.Func([IDL.Bool], [IDL.Bool], []),
    'swapExactTokensForTokens' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text), IDL.Principal, IDL.Int],
        [TxReceipt],
        [],
      ),
    'symbol' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'totalSupply' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'transferFrom' : IDL.Func(
        [IDL.Text, IDL.Principal, IDL.Principal, IDL.Nat],
        [IDL.Bool],
        [],
      ),
    'updateAllTokenMetadata' : IDL.Func([], [IDL.Bool], []),
    'updateTokenFees' : IDL.Func([], [IDL.Bool], []),
    'updateTokenMetadata' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'updateTokenType' : IDL.Func([IDL.Principal, IDL.Text], [IDL.Bool], []),
    'updateTokenTypeValidate' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [ValidateFunctionReturnType],
        [],
      ),
    'validateExecuteFundRecoveryForUser' : IDL.Func(
        [IDL.Principal],
        [ValidateFunctionReturnType],
        [],
      ),
    'validateRegisterFundRecoveryForUser' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [ValidateFunctionReturnType],
        [],
      ),
    'withdraw' : IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'withdrawTo' : IDL.Func([IDL.Principal, IDL.Principal], [TxReceipt], []),
  });
};
export const init = ({ IDL }) => { return []; };