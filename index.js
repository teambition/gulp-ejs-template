'use strict';
/*
 * gulp-ng-template
 * https://github.com/teambition/gulp-ejs-template
 *
 * Copyright (c) 2014 Yan Qing
 * Licensed under the MIT license.
 */
var fs = require('fs');
var util = require('util');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var ejs = require('./lib/ejs');
var packageName = require('./package.json').name;

module.exports = function(options) {
  options = options || {};

  var joinedContent = '';
  var moduleName = options.moduleName || 'templates';
  var contentTpl = 'templates[\'%s\'] = %s;\n\n';
  var templates = fs.readFileSync('./lib/templates.js', {encoding: 'utf8'});
  var joinedFile = new gutil.File({
    cwd: __dirname,
    base: __dirname,
    path: path.join(__dirname, moduleName + '.js')
  });

  templates = templates.replace('moduleName', moduleName);

  return through.obj(function(file, encoding, next) {
    if (file.isNull()) return next();
    if (file.isStream()) return this.emit('error', new gutil.PluginError(packageName,  'Streaming not supported'));

    var name = path.relative(file.base, file.path);
    var tpl = new ejs(file.contents.toString('utf8'), options.delimiter);
    joinedContent += util.format(contentTpl, normalizeName(name), tpl.compile());
    next();
  }, function() {
    joinedContent = joinedContent.trim().replace(/^/gm, '  ');
    joinedFile.contents = new Buffer(templates.replace('/*PLACEHOLDER*/', joinedContent));
    this.push(joinedFile);
    this.push(null);
  });

  function normalizeName(name) {
    return name.replace('\\', '/').replace(path.extname(name), '');
  }
};
