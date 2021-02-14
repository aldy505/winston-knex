/**
 * @module 'winston-knex'
 * @fileoverview Knex Transport for Winston 3.x
 * @license MIT
 * @author Reinaldy Rafli <hi@reinaldyrafli.com> (https://github.com/aldy505)
 */

import knex, {
  Client,
  ConnectionConfigProvider,
  MigratorConfig,
  PoolConfig,
  SeederConfig,
  StaticConnectionConfig,
  Transaction,
} from 'knex';
import winston from 'winston'
import TransportStream from 'winston-transport';

// eslint-disable-next-line @typescript-eslint/ban-types
interface KnexConfig<SV extends {} = any> {
  debug?: boolean;
  client?: string | typeof Client;
  dialect?: string;
  version?: string;
  connection?: string | StaticConnectionConfig | ConnectionConfigProvider;
  pool?: PoolConfig;
  migrations?: MigratorConfig;
  postProcessResponse?: (result: any, queryContext: any) => any;
  wrapIdentifier?: (
    value: string,
    // eslint-disable-next-line no-shadow
    origImpl: (value: string) => string,
    queryContext: any
  ) => string;
  seeds?: SeederConfig<SV>;
  acquireConnectionTimeout?: number;
  useNullAsDefault?: boolean;
  searchPath?: string | readonly string[];
  asyncStackTraces?: boolean;
}

interface KnexTransportOptions extends KnexConfig, TransportStream.TransportStreamOptions {
  level?: string,
  label?: string,
  silent?: boolean,
  tableName?: string,
}

interface QueryOptions {
  from?: Date,
  until?: Date,
  limit?: number,
  start?: number,
  order?: 'asc' | 'desc',
  fields?: any,
  rows?: number
}

type WinstonLogCallback = (err?: any, res?: any) => void;

class KnexTransport extends TransportStream {
  public name: string;

  public label: string;

  public tableName: string;

  public client: knex<any, unknown[]>;

  /**
 * Constructor for KnexTransport
 * @constructor
 * @param {Object} options
 * @param {String} options.client Database client
 * @param {String} options.label Logs label
 * @param {String} options.level Logs level (defaults to info)
 * @param {String} options.silent Silent logs (or not)
 * @param {String|Object} options.connection Database connection URI
 * @param {String} options.tableName Database table name (defaults to logs)
 */
  public constructor(options: KnexTransportOptions = {}) {
    super(options);
    TransportStream.call(this, options);
    this.name = 'KnexTransport';
    this.level = options.level || 'info';
    this.label = options.label || '';
    this.silent = options.silent || false;
    const { connection } = options;
    if (!options.connection) {
      throw new Error('You should provide database connection.');
    }
    this.client = knex({
      client: options.client,
      connection,
    });
    this.tableName = options.tableName || 'logs';

    this.init();
  }

  public async init(): Promise<boolean | string> {
    try {
      const { client, tableName } = this;
      const checkTable = await client.schema.hasTable(tableName);
      if (!checkTable) {
        return client.transaction(
          (trx: Transaction) => trx.schema.createTable(tableName, (table) => {
            table.timestamp('timestamp').defaultTo(client.fn.now());
            table.string('level');
            table.string('message');
            table.json('meta');
          })
            .transacting(trx)
            .then(trx.commit)
            .catch(trx.rollback),
        )
          .then(() => Promise.resolve(true))
          .catch((e) => Promise.reject(e));
      }
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
       * Core logging
       * @param {Object} info Logs arguments
       * @param {String} info.level Logs level
       * @param {*} info.message Logs message
       * @param {*} info.meta Logs meta
       * @param {Function} callback Continuation to respond to when complete
       */
  public log(info: any, callback: WinstonLogCallback): void {
    setImmediate(() => {
      const { level, message, meta } = info;
      const { client, tableName } = this;
      return client.transaction((trx: Transaction) => trx(tableName)
        .insert({ level, message, meta })
        .transacting(trx)
        .then(trx.commit)
        .catch(trx.rollback)).then(() => {
        this.emit('logged', info);
        callback(null, true);
      }).catch((error) => {
        this.emit('error', error);
        callback(error, false);
      });
    });
  }

  public query(options: QueryOptions, callback: WinstonLogCallback) {
    const { client, tableName } = this;

    const sql = ['SELECT'];

    if (options.fields && typeof options.fields === 'string') {
      sql.push(options.fields);
    } else if (options.fields && Array.isArray(options.fields)) {
      sql.push(options.fields.join(', '));
    } else if (!options.fields) {
      sql.push('*');
    }

    sql.push('FROM', tableName, 'WHERE');

    if (options.from && options.until) {
      sql.push(`(timestamp BETWEEN ${options.from} AND ${options.until})`);
    } else if (options.from && !options.until) {
      sql.push(`(timestamp >= ${options.from})`);
    } else if (options.until && !options.from) {
      sql.push(`(timestamp <= ${options.until})`);
    } else if (!options.until && !options.from) {
      sql.push('1');
    }

    if (options.limit && options.start) {
      sql.push(`LIMIT ${Number(options.limit)} OFFSET ${Number(options.start)}`);
    } else if (!options.limit && options.start) {
      sql.push(`LIMIT 18446744073709551615 OFFSET ${Number(options.start)}`);
    } else if (!options.start && options.limit) {
      sql.push(`LIMIT ${options.limit}`);
    }

    if (options.order) {
      sql.push(`ORDER BY timestamp ${options.order.toUpperCase}`);
    }

    return client.transaction((trx: Transaction) => trx.raw(sql.join(' ')))
      .then((res) => {
        callback(null, res);
      })
      .catch((err) => {
        callback(err);
      });
  }
}

declare module 'winston' {
  export interface Transports {
    KnexTransport: KnexTransport
    KnexTransportOptions: KnexTransportOptions
  }
}

export interface WinstonKnexTransport {
  KnexTransport: KnexTransport;
}

// winston.transports.KnexTransport = KnexTransport as any;
export default KnexTransport;
