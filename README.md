# Winston Transport for Knex

![npm](https://img.shields.io/npm/v/winston-knex?style=flat-square) ![npm](https://img.shields.io/npm/dw/winston-knex?style=flat-square) ![GitHub Release Date](https://img.shields.io/github/release-date/aldy505/winston-knex?style=flat-square) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/aldy505/winston-knex?style=flat-square) ![GitHub](https://img.shields.io/github/license/aldy505/winston-knex?style=flat-square)

This module is here because I can't find Knex Transport that supports Winston 3.x, so I made one.

<strong>This already includes Typescript typings.</strong> No need to find `@types/winston-knex`.

This is still a work in progress. Use it at your own risk (of errors, I mean). If you want to collaborate, please create a new issue (pull request will be welcomed too). I can't test all the database provided by Knex, I only can do mysql and postgres, all help would be welcome.

If you want to help with the development, I could really use a hand for testing the module as I'm very new to making these.

## Installation

```bash
$ npm install winston-knex
# OR IF YOU PREFER YARN
$ yarn add winston-knex
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
- [ ] Querying logs (query function)

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

## License

[MIT](https://github.com/aldy505/winston-knex/blob/master/LICENSE)