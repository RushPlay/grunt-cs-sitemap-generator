'use strict';

var _ = require('lodash'),
    PATH = require('path'),
    URL = require('url');

exports.generate = generate;

function generate (creator, version, brandKey, siteVersion) {
  var indexFolder = creator.files.templates.index.folder,
      dirname = creator.files.templates.dirname,
      filename = creator.files.templates.filename,
      getFilename = _.template(filename),
      languages = Object.keys(version),
      xml = [];

  xml.push('<?xml version="1.0" encoding="UTF-8"?>');
  xml.push('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
    'xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" ' +
    'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');

  languages.forEach(function (language) {
    var path = PATH.join(indexFolder, brandKey, dirname, getFilename({language: language})),
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