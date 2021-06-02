import {resolve} from 'path';
import dotenv from 'dotenv';
import winston from 'winston';
import knex from 'knex';
import KnexTransport from '../src/index';
import test from 'ava';

dotenv.config({path: resolve(__dirname, './../.env')});

const options = {
  client: 'pg',
  connection: String(process.env.POSTGRES_CONNECTION_URL),
  tableName: 'logger'
};
const db = knex(options);

test.beforeEach(async t => {
  try {
    // Check database status
    const trxProvider = db.transactionProvider();
    const trx = await trxProvider();
    await trx.raw('SELECT sum(numbackends) FROM pg_stat_database;');

    // Check if table exists, if true, we drop the table.
    const trx2 = await trxProvider();
    const exists = await trx2.schema.hasTable(options.tableName);
    if (exists) {
      await trx2.schema.dropTable(options.tableName);
      console.log('table dropped');
      t.pass();
    }

    t.pass();
  } catch (error) {
    t.fail(JSON.stringify(error));
  }
});

test.serial('should fire a log to the database', async t => {
  try {
    const logger = winston.createLogger({
      level: 'info',
      transports: [
        new KnexTransport(options)
      ]
    });

    const logMessage = [
      'this is info log',
      'this is a warn log',
      'this is an error log'
    ];

    console.log('pg #1 - inserting log messages');
    logger.info(logMessage[0]);
    logger.warn(logMessage[1]);
    logger.error(logMessage[2]);

    const trxProvider = db.transactionProvider();
    const trx = await trxProvider();
    console.log('pg #1 - checking log message from db');

    const logs = await trx(options.tableName).select('*').orderBy('timestamp', 'asc');

    for (let i = 0; i < logs.length; i++) {
      const {message} = logs[i];
      t.is(message, logMessage[i]);
    }
  } catch (error) {
    t.fail(JSON.stringify(error));
  }
});

test.serial('should fire an object log to the database', async t => {
  try {
    const logger = winston.createLogger({
      level: 'info',
      transports: [
        new KnexTransport(options)
      ]
    });

    const logMessage = [
      {
        level: 'info',
        message: 'this is info log'
      },
      {
        level: 'warn',
        message: 'this is a warn log'
      },
      {
        level: 'error',
        message: 'this is an error log'
      }
    ];

    console.log('pg #2 - inserting log messages');
    logger.log(logMessage[0]);
    logger.log(logMessage[1]);
    logger.log(logMessage[2]);

    const trxProvider = db.transactionProvider();
    const trx = await trxProvider();

    console.log('pg #2 - checking log message from db');

    const logs = await trx(options.tableName).select('*').orderBy('timestamp', 'asc');

    for (let i = 0; i < logs.length; i++) {
      const {message, level} = logs[i];
      t.is(message, logMessage[i].message);
      t.is(level, logMessage[i].level);
    }
  } catch (error) {
    t.fail(JSON.stringify(error));
  }
});
