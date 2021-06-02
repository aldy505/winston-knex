import test from 'ava';
import winston from 'winston';
import KnexTransport from '../src/index';

test('should throws an error', t => {
  t.throws(() => winston.createLogger({transports: [new KnexTransport()]}), {message: 'You should provide database connection.'});
});
