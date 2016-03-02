'use strict';

var fs = require('fs');

exports.work = work;

function work (path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err || !data) return reject(err);
      resolve(JSON.parse(data));
    });
  });
};