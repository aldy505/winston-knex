/**
 * @module 'winston-knex'
 * @fileoverview Knex Transport for Winston 3.x
 * @license MIT
 * @author Reinaldy Rafli <hi@reinaldyrafli.com> (https://github.com/aldy505)
 */

import util from 'util';
import knex from 'knex';
import winston from 'winston';
import Transport from 'winston-transport';

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
const KnexTransport = function (opts = {}) {
  Transport.call(this, opts);
  this.name = 'KnexTransport';
  this.level = opts.level || 'info';
  this.label = opts.label || '';
  this.silent = opts.silent || false;
  const { connection } = opts;
  if (!opts.connection) {
    throw new Error('You should provide database connection.');
  }
  this.client = knex({
    client: opts.client,
    connection,
  });
  this.tableName = opts.tableName || 'logs';

  /**
   * Initialize connection & table
   * @return {Promise} Knex Promise
   */
  async function setupDatabaseTable({ client, tableName }) {
    return client.transaction((trx) => {
      trx.schema.hasTable(tableName)
        .then((exist) => {
          if (!exist) {
            return client.transaction((trx2) => {
              trx2.schema.createTable(tableName, (table) => {
                table.timestamp('timestamp').defaultTo(knex.fn.now());
                table.string('level');
                table.string('message');
                table.json('meta');
              })
                .transacting(trx2)
                .then(trx2.commit())
                .catch(trx2.rollback());
            })
              .then(() => null)
              .catch((e) => { throw Error(e); });
          }
          return null;
        })
        .then(() => null)
        .catch((e) => { throw Error(e); });
    })
      .then(() => null)
      .catch((e) => { throw Error(e); });
  }
  setupDatabaseTable({ client: this.client, tableName: this.tableName });
};

util.inherits(KnexTransport, Transport);

KnexTransport.prototype.init = function () {
  const { client, tableName } = this;
  return client.transaction((trx) => {
    trx.schema.hasTable(tableName)
      .then((exist) => {
        if (!exist) {
          return client.transaction((trx2) => {
            trx2.schema.createTable(tableName, (table) => {
              table.timestamp('timestamp').defaultTo(knex.fn.now());
              table.string('level');
              table.string('message');
              table.json('meta');
            })
              .transacting(trx2)
              .then(trx2.commit())
              .catch(trx2.rollback());
          })
            .then(() => null)
            .catch((e) => { throw Error(e); });
        }
        return null;
      })
      .then(() => null)
      .catch((e) => { throw Error(e); });
  })
    .then(() => null)
    .catch((e) => { throw Error(e); });
};

/**
   * Core logging
   * @param {Object} args Logs arguments
   * @param {String} args.level Logs level
   * @param {*} args.message Logs message
   * @param {*} args.meta Logs meta
   * @param {Function} callback Continuation to respond to when complete
   */
KnexTransport.prototype.log = function (args, callback = () => {}) {
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
    return true;
  }).catch((error) => {
    this.emit('error', error);
    callback(error);
    return null;
  });
};

winston.transports.KnexTransport = KnexTransport;
module.exports = KnexTransport;
