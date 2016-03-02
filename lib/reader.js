'use strict';

/**
 * @module reader
 * @public work
 * @description
 * Read json config
 */
var fs = require('fs');

/**
 * @return Promise
 */
exports.work = work;

function work (path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err || !data) return reject(err);
      resolve(JSON.parse(data));
    });
  });
}