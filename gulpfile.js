var gulp = require('gulp');
var react = require('gulp-react');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var umd = require('gulp-umd');

gulp.task('watch', function () {
  'use strict';
  gulp.watch('./lib/react-reorderable.js', ['build']);
});

gulp.task('react', function () {
  'use strict';
  return gulp.src(['./lib/react-reorderable.js'])
    .pipe(react())
    .pipe(umd({
      exports: function () {
        return 'ReactReorderable';
      },
      namespace: function () {
        return 'ReactReorderable';
      },
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
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['react'], function () {
  'use strict';
  return gulp.src(['./dist/react-reorderable.js'])
    .pipe(uglify())
    .pipe(rename('react-reorderable-min.js'))
    .pipe(gulp.dest('./dist'));
});

