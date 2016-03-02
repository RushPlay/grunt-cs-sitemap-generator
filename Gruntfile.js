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

    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'lib/*.js',
        'index.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*.test.js']
    },

    // sitemap generation
    sitemapGeneration: {
      customOptions: {
        options: {
          configFilePath: 'sitemapConfig.json',
        }
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['jshint', 'nodeunit']);

  grunt.registerTask('default', ['sitemapGeneration']);
};
