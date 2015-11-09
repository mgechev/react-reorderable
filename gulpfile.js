var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('minify', ['browserify'], function () {
  'use strict';
  return gulp.src('./dist/react-reorderable.js')
    .pipe(rename('ReactReorderable.js'))
    .pipe(uglify())
    .pipe(rename('react-reorderable.min.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('browserify', function () {
  'use strict';
  return browserify(['./lib/react-reorderable.js'], {
      standalone: 'ReactReorderable'
    })
    .external(['react', 'react-dom', 'react-drag'])
    .bundle()
    .pipe(source('ReactReorderable.js'))
    .pipe(buffer())
    .pipe(rename('react-reorderable.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['minify']);

