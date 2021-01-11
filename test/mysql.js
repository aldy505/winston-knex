/* eslint-disable */
const { resolve } = require('path')
require('dotenv').config({path: resolve(__dirname, './../.env')})
const { assert, expect, should } = require('chai')
const KnexTransport = require('../build/index.js')
const { createLogger } = require('winston')


const options = {
    client: 'mysql',
    connection: process.env.MYSQL_CONNECTION_STRING
}

describe("Mysql test", function() {
    it("should return a logger instance", function() {
        createLogger({
            transports: [new KnexTransport(options)]
        })
        
    })
    it("should test abstract-winston-transport", function() {
        require('abstract-winston-transport')({
            name: 'KnexTransport',
            Transport: require('../build/index.js'),
            construct: options
          });
    })
})