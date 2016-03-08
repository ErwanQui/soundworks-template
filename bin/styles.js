var fse = require('fs-extra');
var path = require('path');
var sass = require('node-sass');

'use strict';

/**
 * Find all files recursively in `srcDirectory` that pass the allowed function
 * and are not prefixed by `_`. Transpile them to the `distDirectory`
 */
function processSass() {
  fse
    .walk(srcDirectory)
    .on('data', function(item) {
      var filename = item.path;
      var basename = path.basename(filename);

      if (isAllowed(filename) && !/^_/.test(basename)) {
        var outFile = filename
          .replace(new RegExp('^' + srcDirectory), distDirectory)
          .replace(/\.scss$/, '.css');

        sass.render({
          file: filename,
          outputStyle: 'compressed',
          sourceMap: true,
          outFile: outFile,
        }, function(err, result) {
          if (err) {
            console.log(('%s:%s').red, err.file, err.line);
            console.log(('=> Error: %s').red, err.message);
            return;
          }

          fse.outputFile(outFile, result.css, function(err) {
            if (err)
              return console.error((err.message).red);

            console.log('=> "%s" successfully written'.green, outFile);
          });
        });
      }
    });
}

module.exports = {
  process: processSass,
};