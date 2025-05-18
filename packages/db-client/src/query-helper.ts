import { Transaction, QueryTypes, FindOptions } from 'sequelize';
import { DatabaseClient } from './client';

export class QueryHelper {
  private db: DatabaseClient;

  constructor(db: DatabaseClient) {
    this.db = db;
  }

  /**
   * Execute a raw SQL query
   */
  public async rawQuery<T>(
    sql: string,
    options: {
      replacements?: Record<string, any>;
      type?: QueryTypes;
      transaction?: Transaction;
    } = {}
  ): Promise<T[]> {
    return this.db.sequelize.query(sql, {
      replacements: options.replacements,
      type: options.type || QueryTypes.SELECT,
      transaction: options.transaction,
    }) as unknown as Promise<T[]>;
  }

  /**
   * Execute a query within a transaction
   */
  public async withTransaction<T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    const transaction = await this.db.sequelize.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Insert records in batch
   */
  public async batchInsert(
    tableName: string,
    records: Record<string, any>[],
    options: {
      schema?: string;
      transaction?: Transaction;
      onConflict?: string;
    } = {}
  ): Promise<void> {
    if (!records.length) return;

    const schema = options.schema ? `${options.schema}.` : '';
    const fullTableName = `${schema}${tableName}`;
    
    // Get column names from the first record
    const columns = Object.keys(records[0]);
    
    // Create placeholders for values
    const placeholders = records.map((_, recordIndex) => 
      `(${columns.map((_, colIndex) => `:${colIndex}_${recordIndex}`).join(',')})`
    ).join(',');
    
    // Prepare replacements
    const replacements: Record<string, any> = {};
    records.forEach((record, recordIndex) => {
      columns.forEach((col, colIndex) => {
        const key = `${colIndex}_${recordIndex}`;
        replacements[key] = record[col];
      });
    });
    
    // Build SQL query
    let sql = `INSERT INTO ${fullTableName} (${columns.join(',')}) VALUES ${placeholders}`;
    
    // Add ON CONFLICT clause if specified
    if (options.onConflict) {
      sql += ` ${options.onConflict}`;
    }
    
    await this.rawQuery(sql, {
      replacements,
      transaction: options.transaction,
      type: QueryTypes.INSERT
    });
  }
}