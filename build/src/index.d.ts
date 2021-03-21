/**
 * @module 'winston-knex'
 * @fileoverview Knex Transport for Winston 3.x
 * @license MIT
 * @author Reinaldy Rafli <hi@reinaldyrafli.com> (https://github.com/aldy505)
 */
import { Knex } from 'knex';
import TransportStream from 'winston-transport';
interface KnexConfig<SV extends {} = any> {
    debug?: boolean;
    client?: string | typeof Knex.Client;
    dialect?: string;
    version?: string;
    connection?: string | Knex.StaticConnectionConfig | Knex.ConnectionConfigProvider;
    pool?: Knex.PoolConfig;
    migrations?: Knex.MigratorConfig;
    postProcessResponse?: (result: any, queryContext: any) => any;
    wrapIdentifier?: (value: string, origImpl: (value: string) => string, queryContext: any) => string;
    seeds?: Knex.SeederConfig<SV>;
    acquireConnectionTimeout?: number;
    useNullAsDefault?: boolean;
    searchPath?: string | readonly string[];
    asyncStackTraces?: boolean;
}
interface KnexTransportOptions extends KnexConfig, TransportStream.TransportStreamOptions {
    level?: string;
    label?: string;
    silent?: boolean;
    tableName?: string;
}
declare type WinstonLogCallback = (err?: any, res?: any) => void;
declare class KnexTransport extends TransportStream {
    name: string;
    label: string;
    tableName: string;
    client: Knex<any, unknown[]>;
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
    constructor(options?: KnexTransportOptions);
    init(): Promise<boolean | string>;
    /**
     * Core logging
     * @param {Object} info Logs arguments
     * @param {String} info.level Logs level
     * @param {*} info.message Logs message
     * @param {*} info.meta Logs meta
     * @param {Function} callback Continuation to respond to when complete
     */
    log(info: Record<string, any>, callback: WinstonLogCallback): void;
}
declare module 'winston' {
    interface Transports {
        KnexTransport: KnexTransport;
        KnexTransportOptions: KnexTransportOptions;
    }
}
export interface WinstonKnexTransport {
    KnexTransport: KnexTransport;
}
export default KnexTransport;
