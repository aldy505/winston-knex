import { resolve } from 'path';
import dotenv from 'dotenv';
import winston from 'winston';
import knex from 'knex';
import { assert } from 'chai';
import KnexTransport from '../src/index';

dotenv.config({ path: resolve(__dirname, './../.env.test') });

const options = {
  client: 'mysql',
  connection: String(process.env.MYSQL_CONNECTION_URL),
  tableName: 'winston_knex',
};

const db = knex(options);

const logger = winston.createLogger({
  transports: [new KnexTransport(options)],
});

describe('mysql test', () => {
  it('should output a logger instance', (done) => {
    assert.isDefined(logger);
    done();
  });

  it('(without callback) should be able to write to db', (done) => {
    const logMessage = `This is a mysql error test - ${Date.now()}`;
    assert(logger.error(logMessage));
    done();
  });

  it('(with callback) should be able to write to db', (done) => {
    const logMessage = `This is a mysql info test with callback - ${Date.now()}`;
    return logger.info(logMessage, (err, level, message, meta) => {
        console.log(err, level, message, meta)
      assert.isDefined(message);
      done();
      });
  });

  it('should be able to query logs', (done) => {
    logger.query({
      fields: ['message', 'level'],
    }, (err, result) => {
      if (err) done(err);
      assert.isDefined(result);
      done();
    });
  });

  it('should create a table called winston_knex', (done) => {
    setImmediate(() => {
      const transport = new KnexTransport(options);
      transport.init();
    });
    return db.transaction((trx) => trx.schema
      .hasTable('winston_knex'))
      .then((res) => {
        assert.isTrue(res);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
