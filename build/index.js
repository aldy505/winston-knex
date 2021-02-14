import knex from 'knex';
import TransportStream from 'winston-transport';

/**
 * @module 'winston-knex'
 * @fileoverview Knex Transport for Winston 3.x
 * @license MIT
 * @author Reinaldy Rafli <hi@reinaldyrafli.com> (https://github.com/aldy505)
 */

class KnexTransport extends TransportStream {
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
  constructor(options = {}) {
    super(options);
    TransportStream.call(this, options);
    this.name = 'KnexTransport';
    this.level = options.level || 'info';
    this.label = options.label || '';
    this.silent = options.silent || false;
    const {
      connection
    } = options;

    if (!options.connection) {
      throw new Error('You should provide database connection.');
    }

    this.client = knex({
      client: options.client,
      connection
    });
    this.tableName = options.tableName || 'logs';
    this.init();
  }

  async init() {
    try {
      const {
        client,
        tableName
      } = this;
      const checkTable = await client.schema.hasTable(tableName);

      if (!checkTable) {
        return client.transaction(trx => trx.schema.createTable(tableName, table => {
          table.timestamp('timestamp').defaultTo(client.fn.now());
          table.string('level');
          table.string('message');
          table.json('meta');
        }).transacting(trx).then(trx.commit).catch(trx.rollback)).then(() => Promise.resolve(true)).catch(e => Promise.reject(e));
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


  log(info, callback) {
    setImmediate(() => {
      const {
        level,
        message,
        meta
      } = info;
      const {
        client,
        tableName
      } = this;
      return client.transaction(trx => trx(tableName).insert({
        level,
        message,
        meta
      }).transacting(trx).then(trx.commit).catch(trx.rollback)).then(() => {
        this.emit('logged', info);
        callback(null, true);
      }).catch(error => {
        this.emit('error', error);
        callback(error, false);
      });
    });
  }

  query(options, callback) {
    const {
      client,
      tableName
    } = this;
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

    return client.transaction(trx => trx.raw(sql.join(' '))).then(res => {
      callback(null, res);
    }).catch(err => {
      callback(err);
    });
  }

}

export default KnexTransport;
