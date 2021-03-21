import { resolve } from 'path';
import dotenv from 'dotenv';
import winston from 'winston';
import { knex } from 'knex';
import { assert, expect } from 'chai';
import testSuite from 'abstract-winston-transport';
import KnexTransport from '../src/index';

dotenv.config({ path: resolve(__dirname, './../.env.test') });

const options = {
  client: 'mysql2',
  connection: String(process.env.MYSQL_CONNECTION_URL),
  tableName: 'winston_knex',
};
let db;
let logger;

describe('mysql test', () => {
  before(() => {
    db = knex(options);
    logger = winston.createLogger({
      transports: [new KnexTransport(options)],
    });
  });
  it('should output a logger instance', (done) => {
    assert.isDefined(logger);
    expect(logger.readable).to.be.equal(true);
    expect(logger.writable).to.be.equal(true);
    done();
  });

  it('should have a table called winston_knex', async () => {
    try {
      const res = await db.schema.hasTable('winston_knex');
      expect(res).to.be.equal(true);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  });
});

testSuite({
  name: 'KnexTransport',
  Transport: KnexTransport,
  query: false,
  stream: false,
  construct: options,
});
