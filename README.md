# Winston Transport for Knex

<!-- ![npm](https://img.shields.io/npm/v/winston-knex?style=flat-square) ![npm](https://img.shields.io/npm/dw/winston-knex?style=flat-square) ![GitHub](https://img.shields.io/github/license/aldy505/winston-knex?style=flat-square) -->

This module is here because I can't find Knex Transport that supports Winston 3.x, so I made one.

<strong>This already includes Typescript typings.</strong> No need to find `@types/winston-knex`.

This is still a work in progress. Use it at your own risk (of errors, I mean). If you want to collaborate, please create a new issue. I can't test all the database provided by Knex, I only can do mysql and postgres, all help would be welcome.

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
      tableName: 'dbname'
    })
  ]
})

logger.error('This should inserted into the database')
```

## License

[MIT](https://github.com/aldy505/winston-knex/blob/master/LICENSE)