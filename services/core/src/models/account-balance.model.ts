import { Model, DataTypes, Sequelize } from "sequelize";

export interface IAccountBalance {
  time: Date;
  account_identifier: string;  // Matches Account.account_identifier
  balance: bigint;
}

class AccountBalance extends Model<IAccountBalance> implements IAccountBalance {
  public time!: Date;
  public account_identifier!: string;
  public balance!: bigint;

  static initialize(sequelize: Sequelize) {
    AccountBalance.init(
      {
        time: {
          type: DataTypes.DATE,
          allowNull: false,
          primaryKey: true,
        },
        account_identifier: {
          type: DataTypes.STRING,
          allowNull: false,
          references: {
            model: "accounts",
            key: "account_identifier",
          },
        },
        balance: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "AccountBalance",
        tableName: "account_balances",
        timestamps: false,
      }
    );
  }
}

export default AccountBalance;
