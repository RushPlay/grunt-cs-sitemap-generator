'use strict';

/**
 * @module creator
 * @public work
 * @description
 * Module for create instance of Creator
 * it is used for storage for processing data
 * and parsing json config structure
 */
var _ = require('lodash'),
    caller = require('./caller'),
    promiseObjects = require('promise-all');

/**
 * @description When promise will be resolve return creator instance
 * @return Promise
 */
exports.work = work;

function Creator (data) {
  _.assign(this, data);
  this.protocol = 'https';
  this.cacheTime = 600000;
  this.processing = null;
}

Creator.prototype.domainsHandler = function(domain, name) {
  var self = this, versionPromises = {};

  _.forEach(domain.versions, function (value, key) {
    versionPromises[key] = self.urlHandler(value, name);
  });

  return promiseObjects(versionPromises)
    .then(function (responce) {
      domain.versions = responce;
      domain.name = name;
      return domain;
    });
};

Creator.prototype.urlHandler = function(urls, brandName) {
  var self = this, simpleUrls = [], promisesUrls = [];

  if(_.isEmpty(urls)) return Promise.resolve([]);

  urls.forEach(function (url) {
    if(url.api) promisesUrls.push(caller.work(self, url, brandName));
    else simpleUrls.push(url); 
  });

  return Promise.all(promisesUrls)
    .then(function(urls) {
      return Array.prototype.concat.apply(simpleUrls, urls);
    });
};

function work (data) {
  var creator = new Creator(data), promises;

  promises = _.map(creator.domains, function (domain, key) {
    return creator.domainsHandler(domain, key);
  });

  return Promise.all(promises)
    .then(function (data) {
      creator.processing = data;
      return creator;
    });
}


