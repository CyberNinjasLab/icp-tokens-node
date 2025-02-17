import { Model, DataTypes, Sequelize, Optional } from "sequelize";

export interface IAccount {
  id: number;
  principal: string;
  account_identifier: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AccountCreationAttributes extends Optional<IAccount, "id"> {}

class Account extends Model<IAccount, AccountCreationAttributes> implements IAccount {
  public id!: number;
  public principal!: string;
  public account_identifier!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Account.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        principal: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        account_identifier: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        modelName: "Account",
        tableName: "accounts",
        timestamps: true,
      }
    );
  }
}

export default Account;
