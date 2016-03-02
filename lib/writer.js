'use strict';

/**
 * @module writer
 * @public work
 * @description
 * Write data after processing to xml sitemaps
 */
var _ = require('lodash'),
    sm = require('sitemap'),
    PATH = require('path'),
    generateIndex = require('./index-generator').generate,
    fs = require('fs');

function _getMkdirPromise (path, toResolve) {
  return new Promise(function (resolve, reject) {
    fs.mkdir(path, function (err) {
      if (err && err.code !== 'EEXIST') return reject(err);
      if (err && err.code === 'EEXIST') return resolve(toResolve);
      return resolve(toResolve);
    });
  });
}

function _getWriteFilePromise (path, data, toResolve) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(path, data, function(err) {
      if(err) return reject(err);
      resolve(toResolve);
    });
  });
}

function _getStatPromise (path, toResolve) {
  return new Promise(function (resolve, reject) {
    fs.stat(path, function (err, stats) {
      if (err && err.code === 'ENOENT') return reject(err);
      if (stats.isFile()) return reject(new Error('[This is a file]'));
      return resolve(toResolve || true);
    });
  });
}

/**
 * @description When promise will be resolve return creator instance
 * @return Promise
 */
exports.work = work;

function work (creator) {

  function checkRootFolders() {
    return Promise.all(_.map(creator.files.root, function(folder) {
      return _getStatPromise(folder);
    }));
  }

  function ensureTemplateFolders () {
    var indexFolder = creator.files.templates.index.folder, promises;
    
    promises = _.map(creator.files.root, function(folder, key) {
      var folderPath = PATH.join(folder, indexFolder);
      return _getMkdirPromise(folderPath, {path: folderPath, version: key});
    });

    return Promise.all(promises);
  }

  function ensureBrandFolders (ensureTemplateResponse) {
    var promises = [];

    _.forEach(ensureTemplateResponse, function(data) {
      _.forEach(creator.processing, function(brand, brandKey) {
        var folderPath = PATH.join(data.path, brandKey),
            version = creator.processing[brandKey][data.version];

        if (version) {
          promises.push(_getMkdirPromise(folderPath, {path: folderPath, brandKey: brandKey, version: data.version}));
        }
      });
    });

    return Promise.all(promises);
  }

  function ensureSitemapFolders (brandResponse) {
    var dirname = creator.files.templates.dirname,
        promises = [];

    _.forEach(brandResponse, function(data) {
      var folderPath = PATH.join(data.path, dirname),
          version = creator.processing[data.brandKey][data.version];

      if (version) {
        promises.push(_getMkdirPromise(folderPath, {path: data.path, brandKey: data.brandKey, version: data.version}));
      }
    });

    return Promise.all(promises);
  }

  function writeSitemapsIndex (brandResponse) {
    var fileName = creator.files.templates.index.file,
        promises = [];

    _.forEach(brandResponse, function(data) {
      var filePath = PATH.join(data.path, fileName),
          version = creator.processing[data.brandKey][data.version], indexMap;

      if (version) {
        indexMap = generateIndex(creator, version, data.brandKey, data.version);
        promises.push(_getWriteFilePromise(filePath, indexMap, {path: data.path, brandKey: data.brandKey, version: data.version}));
      }
    });

    return Promise.all(promises);
  }

  function writeSitemaps (brandResponse) {
    var getFilename = _.template(creator.files.templates.filename),
        dirname = creator.files.templates.dirname,
        promises = [];

    _.forEach(brandResponse, function(data) {
      _.forEach(creator.domains[data.brandKey].languages, function(language) {
        var filePath = PATH.join(data.path, dirname, getFilename({language: language})),
            dirPath = PATH.join(data.path, dirname ),
            version = creator.processing[data.brandKey][data.version], sitemap;

        if (version && version[language]) {
          sitemap = sm.createSitemap(version[language]);
          promises.push(_getWriteFilePromise(filePath, sitemap, {path: dirPath, brandKey: data.brandKey, language: language}));
        }
      });
    });

    return Promise.all(promises);
  }

  return checkRootFolders()
          .then(ensureTemplateFolders)
          .then(ensureBrandFolders)
          .then(ensureSitemapFolders)
          .then(writeSitemapsIndex)
          .then(writeSitemaps)
          .then(function () {
            return creator;
          });
}
