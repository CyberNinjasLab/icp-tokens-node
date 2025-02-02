import { Model, DataTypes, Sequelize } from "sequelize";

export interface ITransaction {
  id: bigint;
  type: "transfer" | "burn" | "mint" | "approve";
  from_account?: string;
  from_principal?: string;
  to_account?: string;
  to_principal?: string;
  value: bigint;
  fee?: bigint;
  memo: string;
  timestamp: Date;
  raw_data: object;
}

class Transaction extends Model<ITransaction> implements ITransaction {
  public id!: bigint;
  public type!: "transfer" | "burn" | "mint" | "approve";
  public from_account?: string;
  public from_principal?: string;
  public to_account?: string;
  public to_principal?: string;
  public value!: bigint;
  public fee?: bigint;
  public memo!: string;
  public timestamp!: Date;
  public raw_data!: object;

  static initialize(sequelize: Sequelize) {
    Transaction.init(
      {
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
        },
        type: {
          type: DataTypes.ENUM("transfer", "burn", "mint", "approve"),
          allowNull: false,
        },
        from_account: DataTypes.STRING,
        from_principal: DataTypes.STRING,
        to_account: DataTypes.STRING,
        to_principal: DataTypes.STRING,
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
        raw_data: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Transaction",
        tableName: "transactions",
        timestamps: false,
      }
    );
  }
}

export default Transaction;
