/*
 * grunt-plagin-test
 * https://github.com/bat/grunt-plagin-test
 *
 * Copyright (c) 2016 Batname
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // sitemap generation
    sitemap_generation: {
      custom_options: {
        options: {
          configFilePath: 'sitemapConfig.json',
        }
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['sitemap_generation']);

};
