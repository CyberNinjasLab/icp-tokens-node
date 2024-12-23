// Import the SnsAggregatorCanister class and required types
import { Ledger } from '@icptokens/token-toolkit';
import fs from 'fs/promises';

// const canisterId = 'lrtnw-paaaa-aaaaq-aadfa-cai'; // CONF
// const canisterId = 'wqihv-qyaaa-aaaak-afjoa-cai'; // Windoge XP
// const canisterId = '7pail-xaaaa-aaaas-aabmq-cai'; // ckUSDT
const canisterId = 'wqihv-qyaaa-aaaak-afjoa-cai'; // Random token
const ledger = new Ledger(canisterId, {
  debug: false
});

let data = await ledger.iterateTransactions((transactionBatch) => {
  console.log(transactionBatch[0]);
  return false;
});

// let uniqueAccounts = await ledger.countUniqueAccounts();

// console.log(uniqueAccounts);

// const totalTransactions = await ledger.getTotalTransactions();

// console.log(totalTransactions)

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