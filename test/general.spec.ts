import winston from 'winston';
import { expect } from 'chai';
import KnexTransport from '../src/index';

describe('general test', () => {
  it('should throws an error', () => {
    expect(() => winston.createLogger({ transports: [new KnexTransport()] })).to.throw('You should provide database connection.');
  });
});
