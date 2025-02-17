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
        from_account: {
          type: DataTypes.STRING,
          allowNull: true,
          // Optionally add a reference if desired (note: foreign keys on hypertables may not be enforced)
          references: { model: "accounts", key: "account_identifier" }
        },
        to_account: {
          type: DataTypes.STRING,
          allowNull: true,
          references: { model: "accounts", key: "account_identifier" }
        },
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
            fields: ["timestamp"],
          },
          {
            unique: true,
            fields: ["id", "timestamp"],
          },
        ],
      }
    );
  }
}

export default Transaction;
