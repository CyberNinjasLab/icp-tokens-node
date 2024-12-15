import { Transaction } from '@dfinity/ledger-icrc/dist/candid/icrc_ledger';
import { FormattedTransaction, From, To } from './types';
import { uint8ArrayToHexString } from '@dfinity/utils';
import { AccountIdentifier, SubAccount } from '@dfinity/ledger-icp';

const decodeMemo = (memoArray: Uint8Array | number[]) => {
  
  if (memoArray.length === 8) {
    const hexString = Array.from(memoArray, byte => byte.toString(16).padStart(2, '0')).join('');

    return hexString;
  }
  return "";
};

export function parseTransaction(index: bigint, transaction: Transaction): FormattedTransaction | undefined {
  let type: 'transfer' | 'burn' | 'mint' | 'approve';
  let from: From;
  let to: To;
  let value;
  let fee;
  let memo = "";
  let timestamp;

  if (transaction.burn && transaction.burn.length > 0 && transaction.burn[0]) {
    const burn = transaction.burn[0];

    if (burn.from) {
      let subaccount;
      let accountIdentifier;

      if (burn.from.subaccount && burn.from.subaccount.length && burn.from.subaccount[0] instanceof Uint8Array) {
        subaccount = SubAccount.fromBytes(burn.from.subaccount[0]);

        if (subaccount instanceof SubAccount) {
          accountIdentifier = AccountIdentifier.fromPrincipal({
            principal: burn.from.owner,
            subAccount: subaccount
          });
        }
      }

      if (!subaccount) {
        accountIdentifier = AccountIdentifier.fromPrincipal({
          principal: burn.from.owner
        });
      }

      from = {
        principal: burn.from.owner.toText(),
        account: accountIdentifier?.toHex()
      };

      if (burn.from.subaccount && burn.from.subaccount.length) {
        from.subaccount = uint8ArrayToHexString(burn.from.subaccount[0]);
      }

      type = 'burn';
      value = burn.amount;
      if (burn.memo && burn.memo.length > 0 && burn.memo[0]) {
        memo = decodeMemo(burn.memo[0]);
      }

      timestamp = transaction.timestamp;

      return {
        index,
        type,
        from,
        value,
        fee,
        memo,
        timestamp,
        raw_data: transaction
      };
    }
  } else if (transaction.mint && transaction.mint.length > 0 && transaction.mint[0]) {
    const mint = transaction.mint[0];

    if (mint.to) {
      let subaccount;
      let accountIdentifier;

      if (mint.to.subaccount && mint.to.subaccount.length && mint.to.subaccount[0] instanceof Uint8Array) {
        subaccount = SubAccount.fromBytes(mint.to.subaccount[0]);

        if (subaccount instanceof SubAccount) {
          accountIdentifier = AccountIdentifier.fromPrincipal({
            principal: mint.to.owner,
            subAccount: subaccount
          });
        }
      }

      if (!subaccount) {
        accountIdentifier = AccountIdentifier.fromPrincipal({
          principal: mint.to.owner
        });
      }

      to = {
        principal: mint.to.owner.toText(),
        account: accountIdentifier?.toHex()
      };

      if (mint.to.subaccount && mint.to.subaccount.length) {
        to.subaccount = uint8ArrayToHexString(mint.to.subaccount[0]);
      }

      type = 'mint';
      value = mint.amount;
      if (mint.memo && mint.memo.length > 0 && mint.memo[0]) {
        memo = decodeMemo(mint.memo[0]);
      }

      timestamp = transaction.timestamp;

      return {
        index,
        type,
        to,
        value,
        fee,
        memo,
        timestamp,
        raw_data: transaction
      };
    }
  } else if (transaction.transfer && transaction.transfer.length > 0 && transaction.transfer[0]) {
    const transfer = transaction.transfer[0];

    if (transfer.from) {
      let fromSubaccount;
      let fromAccountIdentifier;

      if (transfer.from.subaccount && transfer.from.subaccount.length && transfer.from.subaccount[0] instanceof Uint8Array) {
        fromSubaccount = SubAccount.fromBytes(transfer.from.subaccount[0]);

        if (fromSubaccount instanceof SubAccount) {
          fromAccountIdentifier = AccountIdentifier.fromPrincipal({
            principal: transfer.from.owner,
            subAccount: fromSubaccount
          });
        }
      }

      if (!fromSubaccount) {
        fromAccountIdentifier = AccountIdentifier.fromPrincipal({
          principal: transfer.from.owner
        });
      }

      from = {
        principal: transfer.from.owner.toText(),
        account: fromAccountIdentifier?.toHex()
      };

      if (transfer.from.subaccount && transfer.from.subaccount.length) {
        from.subaccount = uint8ArrayToHexString(transfer.from.subaccount[0]);
      }

      if (transfer.to) {
        let toSubaccount;
        let toAccountIdentifier;
  
        if (transfer.to.subaccount && transfer.to.subaccount.length && transfer.to.subaccount[0] instanceof Uint8Array) {
          toSubaccount = SubAccount.fromBytes(transfer.to.subaccount[0]);
  
          if (toSubaccount instanceof SubAccount) {
            toAccountIdentifier = AccountIdentifier.fromPrincipal({
              principal: transfer.to.owner,
              subAccount: toSubaccount
            });
          }
        }
  
        if (!toSubaccount) {
          toAccountIdentifier = AccountIdentifier.fromPrincipal({
            principal: transfer.to.owner
          });
        }
  
        to = {
          principal: transfer.to.owner.toText(),
          account: toAccountIdentifier?.toHex()
        };
  
        if (transfer.to.subaccount && transfer.to.subaccount.length) {
          to.subaccount = uint8ArrayToHexString(transfer.to.subaccount[0]);
        }

        if (transfer.to) {
          let toSubaccount;
          let toAccountIdentifier;
    
          if (transfer.to.subaccount && transfer.to.subaccount.length && transfer.to.subaccount[0] instanceof Uint8Array) {
            toSubaccount = SubAccount.fromBytes(transfer.to.subaccount[0]);
    
            if (toSubaccount instanceof SubAccount) {
              toAccountIdentifier = AccountIdentifier.fromPrincipal({
                principal: transfer.to.owner,
                subAccount: toSubaccount
              });
            }
          }
    
          if (!toSubaccount) {
            toAccountIdentifier = AccountIdentifier.fromPrincipal({
              principal: transfer.to.owner
            });
          }
    
          to = {
            principal: transfer.to.owner.toText(),
            account: toAccountIdentifier?.toHex()
          };
    
          if (transfer.to.subaccount && transfer.to.subaccount.length) {
            to.subaccount = uint8ArrayToHexString(transfer.to.subaccount[0]);
          }

          type = 'transfer';
          value = transfer.amount;
          fee = transfer.fee && transfer.fee.length > 0 ? transfer.fee[0] : undefined;
          if (transfer.memo && transfer.memo.length > 0 && transfer.memo[0]) {
            memo = decodeMemo(transfer.memo[0]);
          }

          timestamp = transaction.timestamp;

          return {
            index,
            type,
            from,
            to,
            value,
            fee,
            memo,
            timestamp,
            raw_data: transaction
          };
        }
      }
    }
  } else if (transaction.approve && transaction.approve.length > 0 && transaction.approve[0]) {
    const approve = transaction.approve[0];
  
    if (approve.from) {
      let fromSubaccount;
      let fromAccountIdentifier;
  
      if (approve.from.subaccount && approve.from.subaccount.length && approve.from.subaccount[0] instanceof Uint8Array) {
        fromSubaccount = SubAccount.fromBytes(approve.from.subaccount[0]);
  
        if (fromSubaccount instanceof SubAccount) {
          fromAccountIdentifier = AccountIdentifier.fromPrincipal({
            principal: approve.from.owner,
            subAccount: fromSubaccount
          });
        }
      }
  
      if (!fromSubaccount) {
        fromAccountIdentifier = AccountIdentifier.fromPrincipal({
          principal: approve.from.owner
        });
      }
  
      from = {
        principal: approve.from.owner.toText(),
        account: fromAccountIdentifier?.toHex()
      };
  
      if (approve.from.subaccount && approve.from.subaccount.length) {
        from.subaccount = uint8ArrayToHexString(approve.from.subaccount[0]);
      }

      if (approve.spender) {
        let toSubaccount;
        let toAccountIdentifier;
    
        if (approve.spender.subaccount && approve.spender.subaccount.length && approve.spender.subaccount[0] instanceof Uint8Array) {
          toSubaccount = SubAccount.fromBytes(approve.spender.subaccount[0]);
    
          if (toSubaccount instanceof SubAccount) {
            toAccountIdentifier = AccountIdentifier.fromPrincipal({
              principal: approve.spender.owner,
              subAccount: toSubaccount
            });
          }
        }
    
        if (!toSubaccount) {
          toAccountIdentifier = AccountIdentifier.fromPrincipal({
            principal: approve.spender.owner
          });
        }
    
        to = {
          principal: approve.spender.owner.toText(),
          account: toAccountIdentifier?.toHex()
        };
    
        if (approve.spender.subaccount && approve.spender.subaccount.length) {
          to.subaccount = uint8ArrayToHexString(approve.spender.subaccount[0]);
        }

        type = 'approve';
        value = approve.amount;
        fee = approve.fee && approve.fee.length > 0 ? approve.fee[0] : undefined;
        if (approve.memo && approve.memo.length > 0 && approve.memo[0]) {
          memo = decodeMemo(approve.memo[0]);
        }
      
        timestamp = approve.created_at_time && approve.created_at_time.length > 0 ? approve.created_at_time[0] : BigInt(0);
      
        return {
          index,
          type,
          from,
          to,
          value,
          fee,
          memo,
          timestamp,
          raw_data: transaction
        };
      }
    }
  }
}