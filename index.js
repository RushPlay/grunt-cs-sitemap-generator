'use strict';

var argv = require('yargs'),
    configPath = argv.argv.config,
    reader = require('./lib/reader'),
    creator = require('./lib/creator'),
    writer = require('./lib/writer'),
    time = +new Date();

reader.work(configPath)
  .then(creator.work)
  .then(writer.work)
  .then(function () {
    console.log('All done', (+new Date - time) / 1000 + ' sec');
  })
  .catch(function (err) {
    console.log(err, (+new Date - time) / 1000 + ' sec');
    console.log(err.stack);
  });