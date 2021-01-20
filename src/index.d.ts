/**
 * @module 'winston-knex'
 * @fileoverview Knex Transport for Winston 3.x
 * @license MIT
 * @author Reinaldy Rafli <hi@reinaldyrafli.com> (https://github.com/aldy505)
 */

import { Client, ConnectionConfigProvider, MigratorConfig, PoolConfig, SeederConfig, StaticConnectionConfig } from "knex"
import TransportStream, * as Transport from "winston-transport"
import winston from 'winston'

declare module 'winston' {
  export interface Transports {
    KnexTransport: typeof KnexTransport;
    KnexTransportOptions: KnexTransportOptions;
  }
}

declare module 'winston-knex' {
  export interface WinstonKnexTransport {
    KnexTransport: KnexTransportInstance;
  }

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
      origImpl: (value: string) => string,
      queryContext: any
    ) => string;
    seeds?: SeederConfig<SV>;
    acquireConnectionTimeout?: number;
    useNullAsDefault?: boolean;
    searchPath?: string | readonly string[];
    asyncStackTraces?: boolean;
  }

interface KnexTransportOptions extends KnexConfig, Transport.TransportStreamOptions {
  level?: string,
  label?: string,
  silent?: boolean,
  tableName?: string,
}

interface KnexTransportInstance extends KnexConfig, Transport {
  level?: string,
  label?: string,
  silent?: boolean,
  tableName?: string
  new(opts: KnexTransportOptions): KnexTransportInstance
}

class KnexTransport extends TransportStream {
  
  /**
   * Constructor for KnexTransport
   * @constructor
   * @param {Object} opts
   * @param {String} opts.client Database client
   * @param {String} opts.label Logs label
   * @param {String} opts.level Logs level (defaults to info)
   * @param {String} opts.silent Silent logs (or not)
   * @param {String|Object} opts.connection Database connection URI
   * @param {String} opts.tableName Database table name (defaults to logs)
   */
    constructor(opts: KnexTransportOptions)
  /**
   * Initialize connection & table
   * @return {Promise} Knex Promise
   */
    init(): Promise<boolean>
  /**
   * Core logging
   * @param {*} args Logs arguments
   * @param {*} args.level Logs level
   * @param {*} args.message Logs message
   * @param {*} args.meta Logs meta
   * @param {Function} callback Continuation to respond to when complete
   */
    log(args: any, callback?: () => void): any
  } 

  export = KnexTransport
}