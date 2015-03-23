var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var umd = require('gulp-umd');

gulp.task('minify', ['umd'], function () {
  'use strict';
  return gulp.src('./dist/react-drag.js')
    .pipe(rename('ReactDrag.js'))
    .pipe(uglify())
    .pipe(rename('react-drag.min.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('umd', function () {
  'use strict';
  return gulp.src('./lib/react-drag.js')
    .pipe(rename('ReactDrag.js'))
    .pipe(umd({
      dependencies: function () {
        return [
          {
            name: 'React',
            cjs: 'React',
            global: 'React'
          }
        ];
      }
    }))
   .pipe(rename('react-drag.js'))
   .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['minify']);
