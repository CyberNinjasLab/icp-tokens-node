export const idlFactory = ({ IDL }) => {
  const TransactionType = IDL.Variant({
    'decreaseLiquidity' : IDL.Null,
    'claim' : IDL.Null,
    'swap' : IDL.Null,
    'addLiquidity' : IDL.Null,
    'increaseLiquidity' : IDL.Null,
  });
  const Transaction = IDL.Record({
    'to' : IDL.Text,
    'action' : TransactionType,
    'token0Id' : IDL.Text,
    'token1Id' : IDL.Text,
    'liquidityTotal' : IDL.Nat,
    'from' : IDL.Text,
    'hash' : IDL.Text,
    'tick' : IDL.Int,
    'token1Price' : IDL.Float64,
    'recipient' : IDL.Text,
    'token0ChangeAmount' : IDL.Float64,
    'sender' : IDL.Text,
    'liquidityChange' : IDL.Nat,
    'token1Standard' : IDL.Text,
    'token0Fee' : IDL.Float64,
    'token1Fee' : IDL.Float64,
    'timestamp' : IDL.Int,
    'token1ChangeAmount' : IDL.Float64,
    'token1Decimals' : IDL.Float64,
    'token0Standard' : IDL.Text,
    'amountUSD' : IDL.Float64,
    'amountToken0' : IDL.Float64,
    'amountToken1' : IDL.Float64,
    'poolFee' : IDL.Nat,
    'token0Symbol' : IDL.Text,
    'token0Decimals' : IDL.Float64,
    'token0Price' : IDL.Float64,
    'token1Symbol' : IDL.Text,
    'poolId' : IDL.Text,
  });
  const NatResult = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const RecordPage = IDL.Record({
    'content' : IDL.Vec(Transaction),
    'offset' : IDL.Nat,
    'limit' : IDL.Nat,
    'totalElements' : IDL.Nat,
  });
  const PublicPoolOverView = IDL.Record({
    'id' : IDL.Nat,
    'token0TotalVolume' : IDL.Float64,
    'volumeUSD1d' : IDL.Float64,
    'volumeUSD7d' : IDL.Float64,
    'token0Id' : IDL.Text,
    'token1Id' : IDL.Text,
    'token1Volume24H' : IDL.Float64,
    'totalVolumeUSD' : IDL.Float64,
    'sqrtPrice' : IDL.Float64,
    'pool' : IDL.Text,
    'tick' : IDL.Int,
    'liquidity' : IDL.Nat,
    'token1Price' : IDL.Float64,
    'feeTier' : IDL.Nat,
    'token1TotalVolume' : IDL.Float64,
    'volumeUSD' : IDL.Float64,
    'feesUSD' : IDL.Float64,
    'token0Volume24H' : IDL.Float64,
    'token1Standard' : IDL.Text,
    'txCount' : IDL.Nat,
    'token1Decimals' : IDL.Float64,
    'token0Standard' : IDL.Text,
    'token0Symbol' : IDL.Text,
    'token0Decimals' : IDL.Float64,
    'token0Price' : IDL.Float64,
    'token1Symbol' : IDL.Text,
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'status_code' : IDL.Nat16,
  });
  return IDL.Service({
    'addOwners' : IDL.Func([IDL.Vec(IDL.Principal)], [], []),
    'batchInsert' : IDL.Func([IDL.Vec(Transaction)], [], []),
    'cycleAvailable' : IDL.Func([], [NatResult], []),
    'cycleBalance' : IDL.Func([], [NatResult], ['query']),
    'getBaseRecord' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text)],
        [RecordPage],
        ['query'],
      ),
    'getByPool' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Text],
        [RecordPage],
        ['query'],
      ),
    'getByToken' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Text],
        [RecordPage],
        ['query'],
      ),
    'getOwners' : IDL.Func([], [IDL.Vec(IDL.Principal)], []),
    'getPools' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, PublicPoolOverView))],
        ['query'],
      ),
    'getTx' : IDL.Func([IDL.Nat, IDL.Nat], [RecordPage], ['query']),
    'getTxCount' : IDL.Func([], [IDL.Nat], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'insert' : IDL.Func([Transaction], [], []),
  });
};
export const init = ({ IDL }) => { return []; };