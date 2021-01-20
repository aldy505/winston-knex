/* eslint-disable */
const { resolve } = require('path')
require('dotenv').config({path: resolve(__dirname, './../.env')})
const KnexTransport = require('../build/index.js');
const test_suite = require('abstract-winston-transport');

const options = {
    client: 'pg',
    connection: process.env.POSTGRES_CONNECTION_STRING,
    tableName: 'winston_knex'
}

test_suite({
    name: 'KnexTransport',
    Transport: KnexTransport,
    construct: options
  })