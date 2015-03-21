var gulp = require('gulp');
var react = require('gulp-react');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var umd = require('gulp-umd');

gulp.task('watch', function () {
  'use strict';
  gulp.watch('./lib/react-sortable.js', ['build']);
});

gulp.task('react', function () {
  'use strict';
  return gulp.src(['./lib/react-sortable.js'])
    .pipe(react())
    .pipe(umd({
      exports: function () {
        return 'ReactSortable';
      },
      namespace: function () {
        return 'ReactSortable';
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
  return gulp.src(['./dist/react-sortable.js'])
    .pipe(uglify())
    .pipe(rename('react-sortable-min.js'))
    .pipe(gulp.dest('./dist'));
});

