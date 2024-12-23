import { Principal } from "@dfinity/principal";
import { AccountManager as SNSAccountManager } from "@icptokens/nns-integration"; 

const governanceTreasuryBalance = {
  icp: await SNSAccountManager.getIcpTreasuryBalance(Principal.fromText("2jvtu-yqaaa-aaaaq-aaama-cai")),
  icrc_token: await SNSAccountManager.getIcrcTokenTreasuryBalance(Principal.fromText("2jvtu-yqaaa-aaaaq-aaama-cai"), Principal.fromText("2ouva-viaaa-aaaaq-aaamq-cai"))
};

console.log(governanceTreasuryBalance);
