import { Model, DataTypes, Sequelize } from "sequelize";

export interface ITransaction {
  id: bigint;
  type: "transfer" | "burn" | "mint";
  from_account: string | null;
  to_account: string | null;
  value: string;
  fee?: string;
  memo: string;
  timestamp: Date;
}

class Transaction extends Model<ITransaction> {
  static initialize(sequelize: Sequelize) {
    Transaction.init(
      {
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
        },
        type: {
          type: DataTypes.ENUM("transfer", "burn", "mint"),
          allowNull: false,
        },
        from_account: DataTypes.STRING,
        to_account: DataTypes.STRING,
        value: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        fee: DataTypes.BIGINT,
        memo: DataTypes.STRING,
        timestamp: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Transaction",
        tableName: "transactions",
        timestamps: false,
        indexes: [
          {
            fields: [ "timestamp" ]
          }
        ]
      }
    );
  }
}

export default Transaction;
