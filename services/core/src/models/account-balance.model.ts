import { Model, DataTypes, Sequelize } from "sequelize";

// Define AccountBalance attributes
export interface IAccountBalance {
  time: Date;
  account_id: number;
  balance: bigint;
}

// Define AccountBalance model class
class AccountBalance extends Model<IAccountBalance> implements IAccountBalance {
  public time!: Date;
  public account_id!: number;
  public balance!: bigint;

  static initialize(sequelize: Sequelize) {
    AccountBalance.init(
      {
        time: {
          type: DataTypes.DATE,
          allowNull: false,
          primaryKey: true,
        },
        account_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "accounts",
            key: "id",
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
