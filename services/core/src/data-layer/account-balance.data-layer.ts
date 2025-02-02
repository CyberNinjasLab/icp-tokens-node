import AccountBalance, { IAccountBalance } from './../models/account-balance.model';

class AccountBalanceDataLayer {

  public async upsertBalance(balanceData: IAccountBalance): Promise<void> {
    await AccountBalance.upsert(balanceData);
  }

  public async getBalanceByDate(accountId: number, date: Date): Promise<AccountBalance | null> {
    return await AccountBalance.findOne({
      where: { account_id: accountId, time: date },
    });
  }

  public async getLatestBalance(accountId: number): Promise<AccountBalance | null> {
    return await AccountBalance.findOne({
      where: { account_id: accountId },
      order: [["time", "DESC"]],
    });
  }

  public async getBalanceHistory(accountId: number, days: number): Promise<AccountBalance[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await AccountBalance.findAll({
      where: { account_id: accountId, time: { $gte: startDate } },
      order: [["time", "ASC"]],
    });
  }

  static async getAllBalancesByDate(date: Date): Promise<AccountBalance[]> {
    return await AccountBalance.findAll({
      where: { time: date },
    });
  }
}

export default AccountBalanceDataLayer;
