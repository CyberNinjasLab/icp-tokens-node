// Import the SnsAggregatorCanister class and required types
import { Ledger, FormattedTransaction} from '@icptokens/token-toolkit';
import fs from 'fs/promises';

// const canisterId = 'lrtnw-paaaa-aaaaq-aadfa-cai'; // CONF
const canisterId = 'wqihv-qyaaa-aaaak-afjoa-cai'; // Windoge XP
const targetAccount = '6m7pu-pywr2-5oovu-rjcfu-mrepo-tnq3j-orjsu-c3uoa-3otbg-hddtk-tae';
// const canisterId = '7pail-xaaaa-aaaas-aabmq-cai'; // ckUSDT
// const canisterId = 'wqihv-qyaaa-aaaak-afjoa-cai'; // Random token
const ledger = new Ledger(canisterId, {
  debug: false
});

let data = await ledger.iterateTransactions((transactionBatch) => {
  console.log(transactionBatch[0]);
  return false;
});

let uniqueAccounts = await ledger.countUniqueAccounts();

console.log(uniqueAccounts);

const totalTransactions = await ledger.getTotalTransactions();

console.log(totalTransactions)




let transactionIndexMap: Map<number, FormattedTransaction> = new Map();
let sentTotal: bigint = 0n; 
let receivedTotal: bigint = 0n; 

async function fetchAndIndexTransactions(accountId: string) {
  try {
    await ledger.iterateTransactions((transactionBatch: FormattedTransaction[]) => {
      transactionBatch.forEach((tx, idx) => {

        if (
          (tx.from && (tx.from.principal === accountId || tx.from.account === accountId)) ||
          (tx.to && (tx.to.principal === accountId || tx.to.account === accountId))
        ) {
          const index = transactionIndexMap.size + 1;
          transactionIndexMap.set(index, tx);

          if (tx.from && (tx.from.principal === accountId || tx.from.account === accountId)) {
            sentTotal += BigInt(tx.value);  
          }

          if (tx.to && (tx.to.principal === accountId || tx.to.account === accountId)) {
            receivedTotal += BigInt(tx.value); 
          }
        }
      });
      return true;
    });

 
    console.log(`Общата стойност на транзакциите, изпратени от акаунт ${accountId}: ${sentTotal}`);
    console.log(`Общата стойност на транзакциите, получени от акаунт ${accountId}: ${receivedTotal}`);

    const netValue = receivedTotal - sentTotal;
    console.log(`Нетна стойност за акаунт ${accountId}: ${netValue}`);

    await saveTransactionsToFile();

  } catch (error) {
    console.error('Грешка:', error);
  }
}


async function saveTransactionsToFile() {
  try {
    const transactionsData = Array.from(transactionIndexMap.values())
      .map((tx, index) => {
        const fromPrincipal = tx.from ? tx.from.principal : 'Unknown';
        const fromAccount = tx.from ? tx.from.account : 'Unknown';
        const toPrincipal = tx.to ? tx.to.principal : 'Unknown';
        const toAccount = tx.to ? tx.to.account : 'Unknown';
        return `${index + 1}. From: Principal: ${fromPrincipal}, Account: ${fromAccount} | To: Principal: ${toPrincipal}, Account: ${toAccount} | Amount: ${tx.value} | Timestamp: ${tx.timestamp}`;
      })
      .join('\n');

    await fs.writeFile('indexed_transactions2.txt', transactionsData, 'utf8');

  } catch (error) {
    console.error('Грешка:', error);
  }
}
fetchAndIndexTransactions(targetAccount);

// async function saveHoldersToFile() {
//   try {
//     // Fetch holders and balances
//     let holders = await ledger.collectHoldersAndBalances();

//     console.log(`Number of holders: ${holders.length}`);

//     // Calculate the sum of balances
//     const totalBalance = holders.reduce((sum, holder) => sum + BigInt(holder.balance), BigInt(0));
//     console.log(`Total balance: ${totalBalance.toString()}`); // Convert BigInt to string for safe logging

//     // Format holders data for saving
//     const holdersData = holders
//       .map((holder, index) => `${index + 1}. Address: ${holder.principal}, Balance: ${holder.balance}`)
//       .join('\n');

//     // Save the data to a .txt file
//     await fs.writeFile('holders.txt', holdersData, 'utf8');
//     console.log('Holders data saved to holders.txt');
//   } catch (error) {
//     console.error('Error fetching or saving holders:', error);
//   }
// }

// Execute the function
// saveHoldersToFile();