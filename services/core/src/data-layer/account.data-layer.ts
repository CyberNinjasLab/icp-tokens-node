import Account, { AccountCreationAttributes } from "./../models/account.model";

export default class AccountDataLayer {

  public async createAccount(accountData: AccountCreationAttributes): Promise<Account> {
    return await Account.create(accountData);
  }

  public async updateAccount(principal: string, updates: Partial<AccountCreationAttributes>): Promise<[number, Account[]]> {
    return await Account.update(updates, { where: { principal }, returning: true });
  }

  public async getAccountByPrincipal(principal: string): Promise<Account | null> {
    return await Account.findOne({ where: { principal } });
  }

  public async getAllAccounts(): Promise<Account[]> {
    return await Account.findAll();
  }
}

