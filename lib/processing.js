'use strict';

var _ = require('lodash'),
    URL = require('url');

function getUrls (urls, hostname) {
  return urls.map(function (url) {
    var pathname = _.compact(url.pattern.split('/')).join('/'),
        href = pathname ? hostname + '/' + pathname + '/' : hostname + '/';

    return _.assign({url: href }, _.omit(url, 'pattern'));
  });
}

function getVersions(urls, version, brandName, creator) {
  return _.reduce(creator.domains[brandName].languages, function (result, lanuage) {
    var schema = {
      hostname: URL.format({ protocol: creator.protocol, hostname: version + '.' + creator.domains[brandName].host, pathname: lanuage }),
      cacheTime: creator.cacheTime
    };

    result[lanuage] = _.assign(schema, {urls: getUrls(urls, schema.hostname)});

    return result;
  }, {});
}

module.exports = function (data) {
  var self = this, result = {};

  data.forEach(function (brand) {
    result[brand.name] = {};
    _.forEach(brand.versions, function(urls, key) {
      result[brand.name][key] = getVersions(urls, key, brand.name, self);
    });
  });

  this.processing = result;

  return this;
};