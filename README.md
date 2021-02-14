# Winston Transport for Knex

![npm](https://img.shields.io/npm/v/winston-knex?style=flat-square) ![npm](https://img.shields.io/npm/dw/winston-knex?style=flat-square) ![Codecov](https://img.shields.io/codecov/c/github/aldy505/winston-knex?style=flat-square) ![GitHub Release Date](https://img.shields.io/github/release-date/aldy505/winston-knex?style=flat-square) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/aldy505/winston-knex?style=flat-square) ![GitHub](https://img.shields.io/github/license/aldy505/winston-knex?style=flat-square)

⚠ **Currently a work in progress**

 * Supports Winston 3.x
 * Typescript typings built-in
 * Pure Knex

## Installation

```bash
$ npm install winston-knex
# OR IF YOU PREFER YARN
$ yarn add winston-knex
```

Please also add your working database as dependency as described by Knex's documentation:
```bash
$ npm install pg
$ npm install sqlite3
$ npm install mysql
$ npm install mysql2
$ npm install oracledb
$ npm install mssql
```

## Short Usage

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
      // this config also accept any knex configuration key/params
    })
  ]
})

logger.error('This should inserted into the database')
logger.log({
  level: 'info',
  message: 'This should do as well'
})
```

## TODO

- [ ] Streaming logs (stream function)
- [x] Querying logs (query function)

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