import Account, { AccountCreationAttributes } from "./../models/account.model";

export default class AccountDataLayer {

  public static async createAccount(accountData: AccountCreationAttributes): Promise<Account> {
    return await Account.create(accountData);
  }

  public static async bulkCreateAccounts(accounts: AccountCreationAttributes[]): Promise<Account[]> {
    return await Account.bulkCreate(accounts, { ignoreDuplicates: true });
  }

  public static async updateAccount(principal: string, updates: Partial<AccountCreationAttributes>): Promise<[number, Account[]]> {
    return await Account.update(updates, { where: { principal }, returning: true });
  }

  public static async getAccountByPrincipal(principal: string): Promise<Account | null> {
    return await Account.findOne({ where: { principal } });
  }

  public static async getAllAccounts(): Promise<Account[]> {
    return await Account.findAll();
  }
}

