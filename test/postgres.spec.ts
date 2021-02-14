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
    logger.error(logMessage);
    return db.transaction((trx) => trx('winston_knex')
      .where({ message: logMessage })
      .select()
      .transacting(trx)
      .then(trx.commit)
      .catch(trx.rollback))
      .then((res) => {
        console.log(res);
        assert.propertyVal(res[0], 'message', logMessage);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('(with callback) should be able to write to db', (done) => {
    const logMessage = `This is a postgres info test with callback - ${Date.now()}`;
    logger.info(logMessage, (info) => {
      assert.isDefined(info);
    });
    return db.transaction((trx) => trx('winston_knex')
      .where({ message: logMessage })
      .select()
      .transacting(trx)
      .then(trx.commit)
      .catch(trx.rollback))
      .then((res) => {
        assert.propertyVal(res[0], 'message', logMessage);
        done();
      })
      .catch((err) => {
        done(err);
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
    const transport = new KnexTransport(options);
    transport.init();
    return db.transaction((trx) => trx.schema.hasTable('winston_knex'))
      .then((res) => {
        assert.isTrue(res);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
