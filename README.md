# Winston Transport for Knex

[![npm](https://img.shields.io/npm/v/winston-knex?style=flat-square)](https://www.npmjs.com/package/winston-knex) [![npm](https://img.shields.io/npm/dw/winston-knex?style=flat-square)](https://www.npmjs.com/package/winston-knex) [![Codecov](https://img.shields.io/codecov/c/github/aldy505/winston-knex?style=flat-square)](https://codecov.io/gh/aldy505/winston-knex) [![GitHub Release Date](https://img.shields.io/github/release-date/aldy505/winston-knex?style=flat-square)](https://github.com/aldy505/winston-knex/releases) [![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/aldy505/winston-knex?style=flat-square)](https://github.com/aldy505/winston-knex) [![GitHub](https://img.shields.io/github/license/aldy505/winston-knex?style=flat-square)](https://github.com/aldy505/winston-knex/blob/master/LICENSE)

⚠ **This module is deprecated and no longer maintained. Please switch to other module or use Knex natively.**

 * Supports Winston 3.x
 * Typescript typings built-in
 * Pure Knex

## Installation

```bash
$ npm install winston-knex
# OR IF YOU PREFER YARN
$ yarn add winston-knex
```

Please also add your working database as dependency as described by [Knex's documentation](https://knexjs.org/#Installation-node):
```bash
$ npm install pg
$ npm install sqlite3
$ npm install mysql
$ npm install mysql2
$ npm install oracledb
$ npm install mssql
```

## Usage

```js
const winston = require('winston')
const KnexTransport = require('winston-knex')

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new KnexTransport({
      client: 'mysql',
      connection: 'mysql://user:password@host:port/dbname',
      tableName: 'anyname' // defaults to `logs`
      // this config also accepts any knex configuration key/params
    })
  ]
})

logger.error('This should inserted into the database')
logger.log({
  level: 'info',
  message: 'This should do as well'
})
```
Other methods such as `stream` is not written yet. You can only do `query` function with limited possibility.

## TODO

- [ ] Streaming logs (stream function)
- [x] Querying logs (query function) - ⚠ Need tests
- [ ] Close connection (close function)

To get the logs values, please use knex for now: (there are more way of doing this, mine is just an example)
```js
const knex = require('knex')({ ...config })

async function getLogsValue() {
  try {
    const trxProvider = knex.transactionProvider();
    const trx = await trxProvider();
    const logs = await trx('tableName').select();
    return logs;
  } catch (error) {
    throw new Error(error)
  }
}
```

## Contributing

I will put this simply: Go ahead 😀

## License

[MIT](https://github.com/aldy505/winston-knex/blob/master/LICENSE)
