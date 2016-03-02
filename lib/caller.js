'use strict';

var request = require('request'),
    _ = require('lodash'),
    URL = require('url');

exports.work = work;

function _request(url) {
  return new Promise(function(resolve, reject) {
    request({ url: url,json: true }, function(error, response, body) {
      if (error) return reject(error);
      if (!body) return reject(new Error('empty body responce'));
      if(response.body.status === '404') return reject(new Error('[Api call]: ' + response.body.error));
      resolve(body);
    });
  });
}

function _processing(url, data) {
  var paths = _.compact(url.pattern.split('/'));

  return data.map(function(answer) {

    var patterns = paths.map(function(path) {
      if (path.match(/:\w+/g)) return answer[path.slice(1)].toLowerCase();
      return path;
    });

    return _.assign({ pattern: patterns.join('/') }, _.omit(url, ['api', 'pattern']));
  });
}

function work(url, brandName) {
  var creator = this,
      apiUrl = {protocol: 'https', host: creator.domains[brandName].api, pathname: url.api.pathname, query: url.api.query };

  return _request(URL.format(apiUrl))
    .then(_processing.bind(null, url));
}