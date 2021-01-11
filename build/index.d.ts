/**
 * @module 'winston-knex'
 * @fileoverview Knex Transport for Winston 3.x
 * @license MIT
 * @author Reinaldy Rafli <hi@reinaldyrafli.com> (https://github.com/aldy505)
 */

import { Config } from "knex"

export = KnexTransport

declare namespace KnexTransport {
  interface constructorOptions extends Config {
    level?: string,
    label?: string,
    silent?: boolean,
    tableName?: string
  }

  export class KnexTransport {
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
    constructor(opts: constructorOptions)
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
    log(args: any, callback: () => void): any
  }
}