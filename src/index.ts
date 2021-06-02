/**
 * @module 'winston-knex'
 * @fileoverview Knex Transport for Winston 3.x
 * @license MIT
 * @author Reinaldy Rafli <hi@reinaldyrafli.com> (https://github.com/aldy505)
 */

import {knex, Knex} from 'knex';
import TransportStream from 'winston-transport';

interface KnexConfig<SV extends {} = any> {
  debug?: boolean;
  client?: string | typeof Knex.Client;
  dialect?: string;
  version?: string;
  connection?: string | Knex.StaticConnectionConfig | Knex.ConnectionConfigProvider;
  pool?: Knex.PoolConfig;
  migrations?: Knex.MigratorConfig;
  postProcessResponse?: (_result: any, _queryContext: any) => any;
  wrapIdentifier?: (
    _value: string,
    _origImpl: (_value: string) => string,
    _queryContext: any
  ) => string;
  seeds?: Knex.SeederConfig<SV>;
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
  fields?: string | Array<string>,
  rows?: number
}

type WinstonLogCallback = (_err?: any, _res?: any) => void;

class KnexTransport extends TransportStream {
  public name: string;

  public label: string;

  public tableName: string;

  public client: Knex<any, unknown[]>;

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
  constructor(options: KnexTransportOptions = {}) {
    super(options);

    this.name = 'KnexTransport';
    this.level = options.level || 'info';
    this.label = options.label || '';
    this.silent = options.silent || false;

    const {connection} = options;
    if (!options.connection) {
      throw new Error('You should provide database connection.');
    }

    this.client = knex({
      client: options.client,
      connection
    });
    this.tableName = options.tableName || 'logs';
    this.client.schema.hasTable(this.tableName)
      .then(exists => {
        if (!exists) {
          this.init()
            .then(() => null)
            .catch(e => {
              throw e;
            });
        }
      })
      .catch(e => {
        throw e;
      });
  }

  async init(): Promise<boolean> {
    try {
      const {client, tableName} = this;
      await client.transaction((trx: Knex.Transaction) => {
        return trx.schema
          .createTable(tableName, table => {
            table.timestamp('timestamp').defaultTo(client.fn.now());
            table.string('level');
            table.text('message');
            table.json('meta');
          })
          .transacting(trx)
          .then(trx.commit)
          .catch(trx.rollback);
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
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
  log(info: Record<string, any>, callback: WinstonLogCallback): Promise<void> {
    const {level, message, meta} = info;
    const {client, tableName} = this;
    return client
      .transaction((trx: Knex.Transaction) => trx(tableName)
        .insert({level, message, meta})
        .transacting(trx)
        .then(trx.commit)
        .catch(trx.rollback))
      .then(() => {
        this.emit('logged', info);
        callback(null, true);
      })
      .catch(error => {
        this.emit('error', error);
        callback(error, false);
      });
  }

  query(options: QueryOptions, callback: WinstonLogCallback): Promise<void> {
    const {client, tableName} = this;

    return client.transaction((trx: Knex.Transaction) => trx(tableName)
      .select(options?.fields || '*')
      .whereBetween('timestamp', [options?.from || 0, options?.until || Number.MAX_SAFE_INTEGER])
      .limit(options?.limit || Number.MAX_SAFE_INTEGER)
      .offset(options?.start || 0)
      .orderBy('timestamp', options?.order || 'asc')
      .then(res => {
        callback(null, res);
      })
      .catch(err => {
        callback(err);
      })
    );
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

export default KnexTransport;
