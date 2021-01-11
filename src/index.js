/**
 * @module 'winston-knex'
 * @fileoverview Knex Transport for Winston 3.x
 * @license MIT
 * @author Reinaldy Rafli <hi@reinaldyrafli.com> (https://github.com/aldy505)
 */

import knex from 'knex';
import Transport from 'winston-transport';

class KnexTransport extends Transport {
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
  constructor(opts = {}) {
    super(opts);
    this.name = 'KnexTransport';
    this.level = opts.level || 'info';
    this.label = opts.label || '';
    this.silent = opts.silent || false;
    const { connection } = opts;
    this.client = knex({
      client: opts.client,
      connection,
    });
    this.tableName = opts.tableName || 'logs';
  }

  /**
   * Initialize connection & table
   * @return {Promise} Knex Promise
   */
  init() {
    const { client, tableName } = this;
    return client.schema.hasTable(tableName)
      .then((exist) => {
        if (!exist) {
          return client.schema.createTableIfNotExists(tableName, (table) => {
            table.timestamp('timestamp').defaultTo(knex.fn.now());
            table.string('level');
            table.string('message');
            table.json('meta');
          });
        }
        return null;
      })
      .catch((e) => new Error(e));
  }

  /**
   * Core logging
   * @param {Object} args Logs arguments
   * @param {String} args.level Logs level
   * @param {*} args.message Logs message
   * @param {*} args.meta Logs meta
   * @param {Function} callback Continuation to respond to when complete
   */
  log(args, callback) {
    const { level, message, meta } = args;
    const { client, tableName } = this;
    return client.transaction((trx) => {
      knex(tableName)
        .insert({ level, message, meta })
        .transacting(trx)
        .then(trx.commit)
        .catch(trx.rollback);
    }).then(() => {
      this.emit('logged', args);
      callback(null, true);
      return null;
    }).catch((e) => {
      this.emit('error', e);
      callback(e);
      return null;
    });
  }
}

export default KnexTransport;
