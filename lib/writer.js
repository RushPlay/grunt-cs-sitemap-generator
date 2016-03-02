'use strict';

var _ = require('lodash'),
    sm = require('sitemap'),
    URL = require('url'),
    PATH = require('path'),
    fs = require('fs');

function generateSitemapIndex (version, brandKey, siteVersion) {
  var creator = this,
      getFilename = _.template(creator.files.templates.filename),
      languages = Object.keys(version),
      xml = [];

    xml.push('<?xml version="1.0" encoding="UTF-8"?>');
    xml.push('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
      'xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" ' +
      'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');

    languages.forEach(function (language, index) {
      var path = PATH.join( creator.files.templates.index.folder, 
                            brandKey,
                            creator.files.templates.dirname,
                            getFilename({language: language})),
          href = URL.format({ protocol: creator.protocol,
                              hostname: siteVersion + '.' + creator.domains[brandKey].host,
                              pathname: path });

      xml.push('<sitemap>');
      xml.push('<loc>' + href + '</loc>');
      xml.push('<lastmod>' + new Date() + '</lastmod>');
      xml.push('</sitemap>');
    });

    xml.push('</sitemapindex>');

    return xml.join('\n');
}

exports.work = work;

function work (creator) {

  function checkRootFolders() {
    var promises = _.map(creator.files.root, function(folder) {
      return new Promise(function (resolve, reject) {
        fs.stat(folder, function (err, stats) {
          if (err && err.code === 'ENOENT') return reject(err);
          if (stats.isFile()) return reject(new Error('[This is a file]'));
          return resolve(true);
        });
      });
    });

    return Promise.all(promises);
  }

  function ensureTemplateFolders () {

    var promises = _.map(creator.files.root, function(folder, key) {
      var folderPath = PATH.join(folder, creator.files.templates.index.folder);
      return new Promise(function (resolve, reject) {
        fs.mkdir(folderPath, function (err) {
          if (err && err.code !== 'EEXIST') return reject(err);
          if (err && err.code === 'EEXIST') return resolve({path: folderPath, version: key});
          return resolve({path: folderPath, version: key});
        });
      });
    });

    return Promise.all(promises);
  }

  function ensureBrandFolders (ensureTemplateResponse) {
    var promises = [];

    _.forEach(ensureTemplateResponse, function(data) {
      _.forEach(creator.processing, function(brand, brandKey) {
        var folderPath = PATH.join(data.path, brandKey), promise,
            version = creator.processing[brandKey][data.version];

        if (version) {
          promise = new Promise(function (resolve, reject) {
            fs.mkdir(folderPath, function (err) {
              if (err && err.code !== 'EEXIST') return reject(err);
              if (err && err.code === 'EEXIST') return resolve({path: folderPath, brandKey: brandKey, version: data.version});
              return resolve({path: folderPath, brandKey: brandKey, version: data.version});
            });
          });

          promises.push(promise);
        }
      });
    });

    return Promise.all(promises);
  }

  function ensureSitemapFolders (brandResponse) {
    var promises = [];

    _.forEach(brandResponse, function(data) {
      var folderPath = PATH.join(data.path, creator.files.templates.dirname), promise,
          version = creator.processing[data.brandKey][data.version];

      if (version) {
        promise = new Promise(function (resolve, reject) {
          fs.mkdir(folderPath, function (err) {
            if (err && err.code !== 'EEXIST') return reject(err);
            if (err && err.code === 'EEXIST') return resolve({path: data.path, brandKey: data.brandKey, version: data.version});
            return resolve({path: data.path, brandKey: data.brandKey, version: data.version});
          });
        });

        promises.push(promise);
      }
    });

    return Promise.all(promises);
  }

  function writeSitemapsIndex (brandResponse) {
    var promises = [];

    _.forEach(brandResponse, function(data) {
      var filePath = PATH.join(data.path, creator.files.templates.index.file), promise, sitemap,
          targetFolder = PATH.join(data.path, creator.files.templates.dirname),
          version = creator.processing[data.brandKey][data.version];

      if (version) {
        promise = new Promise(function (resolve, reject) {
          fs.writeFile(filePath, generateSitemapIndex.call(creator, version, data.brandKey, data.version), function(err) {
            if(err) return reject(err);
            resolve({path: data.path, brandKey: data.brandKey, version: data.version});
          });
        });

        promises.push(promise);
      }
    });

    return Promise.all(promises);
  }

  function writeSitemaps (brandResponse) {
    var promises = [],
        getFilename = _.template(creator.files.templates.filename);

    _.forEach(brandResponse, function(data) {
      _.forEach(creator.domains[data.brandKey].languages, function(language) {
        var filePath = PATH.join(data.path, creator.files.templates.dirname, getFilename({language: language})), promise, sitemap,
            version = creator.processing[data.brandKey][data.version];

        if (version && version[language]) {
          sitemap = sm.createSitemap(version[language]);
          promise = new Promise(function (resolve, reject) {
            fs.writeFile(filePath, sitemap, function(err) {
              if(err) return reject(err);
              resolve({path: PATH.join(data.path, creator.files.templates.dirname), brandKey: data.brandKey, language: language});
            });
          });

          promises.push(promise);
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
          .then(writeSitemaps);
}
