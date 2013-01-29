/*
 * grunt-dox
 * https://github.com/mattmcmanus/grunt-dox
 *
 * Copyright (c) 2012 Matt McManus
 * Licensed under the MIT license.
 */

var exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    colors = require('colors');

// Figure out the parent dir to pass to dox-foundation
function parentDir(files) {
  var dirs = [];

  files.forEach(function(file){
    // Grab the first folder listed
    var dir = path.dirname(file).split(path.sep)[0];
    // Add it to the list if it's not there already
    if (dirs.indexOf(dir) == -1) {
      dirs.push(dir);
    }
  });
  // If there is more than one base dir, try again.
  // TODO: This is a crappy way to do this and will
  // probably break in some situations. Works fine if
  // you only are parsing a lib folder
  if (dirs.length > 1) {
    dirs = parentDir(dirs);
  }

  return dirs;
}

module.exports = function(grunt) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('dox', 'Generate dox output ', function() {

    var files = this.filesSrc,
        dest = this.data.dest;
        done = this.async(),
        doxPath = path.resolve(__dirname,'../'),
        _opts = this.options(),
        dir = parentDir(files);

    // Absolute path to the formatter
    var formatter = [doxPath, 'node_modules', '.bin', 'dox-foundation'].join(path.sep);

    // Cleanup any existing docs
    rimraf.sync(dest);

    // Dox requires the folder to be present before trying to save files to dest
    fs.exists(dest, function (exists) {
      if(!exists){
        fs.mkdirSync(dest);
      }
    });

    exec(formatter + ' --source "' + dir + '" --target ' + dest, {maxBuffer: 5000*1024}, function(error, stout, sterr){
      if (error) grunt.log.error("WARN:  "+ error);
      if (!error) {
        if(_opts.verbose){

          grunt.log.writeln('Directory "' + dir + '" doxxed.');
        }

        grunt.log.ok(String(files.length).cyan + ' files doxxed to ' + 'api.html'.yellow);
        
        
        done();
      }
    });
  });

};
