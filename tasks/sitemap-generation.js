'use strict';

/**
 * @module Sitemap generator
 * @description Generation of sitemaps for casinosaga projects
 */
var reader = require('../lib/reader'),
    creator = require('../lib/creator'),
    processing = require('../lib/processing'),
    writer = require('../lib/writer'),
    time = +new Date();

module.exports = function(grunt) {
  grunt.registerMultiTask('sitemapGeneration', 'Sitemap generation>>>>', function() {
    var done = this.async(),
        options = this.options();

    grunt.log.writeln('start sitemaps generation...');

    reader.work(options.configFilePath)
      .then(creator.work)
      .then(processing.work)
      .then(writer.work)
      .then(function () {
        grunt.log.writeln('All done ' + (+new Date() - time) / 1000 + ' sec');
        done();
      })
      .catch(function (err) {
        grunt.log.errorlns('Error found ' + (+new Date() - time) / 1000 + ' sec');
        grunt.log.errorlns(err.stack);
        grunt.fail.warn(err);
      });
  });
};