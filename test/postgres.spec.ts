import { resolve } from 'path';
import dotenv from 'dotenv';
import winston from 'winston';
import knex from 'knex';
import { assert } from 'chai';
import KnexTransport from '../src/index';

dotenv.config({ path: resolve(__dirname, './../.env.test') });

const options = {
  client: 'pg',
  connection: String(process.env.POSTGRES_CONNECTION_URL),
  tableName: 'winston_knex',
};

const db = knex(options);

const logger = winston.createLogger({
  transports: [new KnexTransport(options)],
});

describe('postgres test', () => {
  it('should output a logger instance', (done) => {
    assert.isDefined(logger);
    done();
  });

  it('(without callback) should be able to write to db', (done) => {
    const logMessage = `This is a postgres error test - ${Date.now()}`;
    assert(logger.error(logMessage));
    done();
  });

  it('(with callback) should be able to write to db', async () => {
    try {
      const logMessage = `This is a postgres info test with callback - ${Date.now()}`;
      await logger.info(logMessage, (...info) => {
        assert.isDefined(info);
      });
      const res = await db('winston_knex').where({ message: logMessage }).select('message');
      Promise.resolve(assert.equal(res[0]?.message, logMessage));
    } catch (err) {
      Promise.reject(err);
    }
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

  it('should create a table called winston_knex', async () => {
    try {
      const transport = new KnexTransport(options);
      await transport.init();
      const res = await db.schema.hasTable('winston_knex');
      Promise.resolve(assert.isTrue(res));
    } catch (err) {
      Promise.reject(err);
    }
  });
});