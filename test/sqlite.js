/* eslint-disable */
const { resolve } = require('path')
require('dotenv').config({path: resolve(__dirname, './../.env')})
const KnexTransport = require('../build/index.js');
const test_suite = require('abstract-winston-transport');

const options = {
    client: 'sqlite3',
    connection: () => ({
        filename: process.env.SQLITE_FILENAME
    }),
    tableName: 'logs'
}

test_suite({
    name: 'KnexTransport',
    Transport: KnexTransport,
    construct: options
  })