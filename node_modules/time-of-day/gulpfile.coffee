#!/bin/coffee

gulp = require 'gulp'
coffeeify = require 'coffeeify'
browserify = require 'gulp-browserify'
uglify = require 'gulp-uglify'
rename = require 'gulp-rename'
coffee = require 'gulp-coffee'

gulp.task 'build', ->
  gulp
    .src('./build/build.coffee', {read:false})
    .pipe(
      browserify(
          debug: false
          transform: ['coffeeify']
          extensions: ['.coffee']
      )
    ).pipe(rename('time-of-day.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify(outSourceMaps:false))
    .pipe(rename('time-of-day.min.js'))
    .pipe(gulp.dest('./dist/'))

gulp.task 'coffee', ->
  gulp
    .src('./lib/timeOfDay.coffee')
    .pipe(coffee())
    .pipe(rename('index.js'))
    .pipe(gulp.dest('./'))

gulp.task 'default', [
  'build'
  'coffee'
]




