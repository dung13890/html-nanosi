'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
// var gutil = require('gulp-util');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var del = require('del');
var fs = require('fs');
var pug = require('pug');
var autoprefixer = require('autoprefixer');

var
  source = 'resources/',
  dest = 'public/';

var options = {
  del: [
    'public'
  ],
  browserSync: {
    server: {
      baseDir: dest
    }
  },
  htmlPrettify: {
    'indent_size': 2,
    'unformatted': ['pre', 'code'],
    'indent_with_tabs': false,
    'preserve_newlines': true,
    'brace_style': 'expand',
    'end_with_newline': true
  },
  include: {
    hardFail: true,
    includePaths: [
      __dirname + "/",
      __dirname + "/node_modules",
      __dirname + "/resources/assets/js"
    ]
  },
  pug: {
    pug: pug,
    pretty: '\t'
  }
};

var scss = {
  sassOpts: {
    outputStyle: 'expanded',
    precison: 3,
    errLogToConsole: true,
    includePaths: [
      './node_modules/bootstrap-sass/assets/stylesheets',
      './node_modules/font-awesome/scss/',
      './node_modules/animate.css/',
      './node_modules/owl.carousel/dist/assets/',
      './node_modules/select2/dist/css',
      './node_modules/awesome-bootstrap-checkbox',
      './node_modules/offcanvas-bootstrap/src/sass/'
    ]
  }
};

// fonts
var fonts = {
  in: [
    source + 'assets/fonts/*.*',
    './node_modules/bootstrap-sass/assets/fonts/**/*.*',
    './node_modules/font-awesome/fonts/*', source + 'fonts-2/**/*'
  ],
  out: dest + 'fonts/'
};

// js
var js = {
  in: [
    source + 'assets/js/*.*',
    './node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js',
    './node_modules/owl.carousel/dist/owl.carousel.min.js',
    './node_modules/select2/dist/js/select2.full.min.js',
    './node_modules/offcanvas-bootstrap/dist/js/'
  ],
  out: dest + 'js/'
};

// PostCSS
var processor = [
  autoprefixer({ browsers: ['last 2 versions'] })
];

/**
 * Filter block:
 * Allow add filter
 *
 */
pug.filters.code = function(block) {
  return block
    .replace( /&/g, '&amp;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' )
    .replace( /"/g, '&quot;' );
}

/**
 * Tasks
 * Allow add filter
 *
 */
gulp.task('browser-sync', function() {
  return browserSync.init(options.browserSync);
});

gulp.task('watch', function(cb) {
  $.watch(source + 'assets//sass/**/*.scss', function() {
    gulp.start('compile-styles');
  });

  $.watch(source + 'assets/images/**/*', function() {
    gulp.start('compile-images');
    gulp.start('build-images-name');
  });

  $.watch([
    source + 'views/*.html',
    source + 'views/**/*.html'
    ], function() {
    return runSequence('compile-html', browserSync.reload);
  });

  $.watch([
    source + 'views/*.pug',
    source + 'views/**/*.pug'
  ], function() {
    return runSequence('compile-pug', browserSync.reload);
  });

  $.watch(source + 'assets/**/*.js', function() {
    return runSequence('compile-js', browserSync.reload);
  });

  $.watch(source + 'views/modules/*/data/*.json', function() {
    return runSequence('build-html', browserSync.reload);
  });
});

// copy js
gulp.task('js', function() {
  return gulp
    .src(js.in)
    .pipe(gulp.dest(js.out));
});

// copy font
gulp.task('fonts', function() {
  return gulp
    .src(fonts.in)
    .pipe(gulp.dest(fonts.out));
});

// = Delete
gulp.task('cleanup', function(cb) {
  return del(options.del, cb);
});

// SCSSlint
// gulp.task('scss-lint', function() {
//   return gulp.src([
//     source + '/sass/*.scss',
//     source + '/sass/**/*.scss',
//     '!'+ source +'/sass/vendors/_*.scss'
//   ])
//   .pipe($.cached('scsslint'))
//   .pipe($.scssLint({
//     'config': '.scss-lint.yml'
//   }));
// });

// JShint
gulp.task('jshint', function() {
  return gulp.src([
    '*.js'
  ], {cwd: 'resources/assets/js'})
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

// = Build Style
gulp.task('compile-styles',['fonts'], function(cb) {
  return gulp.src([
    source + 'assets/sass/*.scss',
    '!'+ source +'assets/sass/_*.scss'
  ])
  .pipe($.sourcemaps.init())
  .pipe($.sass(scss.sassOpts)
    .on('error', $.sass.logError))
  .pipe($.postcss(processor))
  .pipe($.rucksack())
  .pipe($.sourcemaps.write('./', {
    includeContent: false,
    sourceRoot: source + 'assets/sass'
  }))
  .pipe(gulp.dest(dest + '/css'))
  .pipe(browserSync.stream());
});

// = Build HTML
gulp.task('compile-html', function(cb) {
  return gulp.src(['*.html', '!_*.html'], {cwd: 'resources/views'})
  .pipe($.prettify(options.htmlPrettify))
  .pipe(gulp.dest(dest));
});

// = Build Pug
gulp.task('compile-pug', function(cb) {
  var jsonData = JSON.parse(fs.readFileSync('./tmp/data.json'));
  options.pug.locals = jsonData;

  return gulp.src(['*.pug', 'templates/**/*.pug', '!_*.pug'], {cwd: 'resources/views'})
    .pipe(plumber(function(error){
        console.log("Error happend!", error.message);
        this.emit('end');
    }))
    .pipe($.changed('public', {extension: '.html'}))
    .pipe($.pugInheritance({
      basedir: "resources/views",
      skip: ['node_modules']
    }))
    .pipe($.pug(options.pug))
    .on('error', function(error) {
      console.error('' + error);
      this.emit('end');
    })
    .pipe($.prettify(options.htmlPrettify))
    .pipe(plumber.stop())
    .pipe(gulp.dest(dest));
});

// = Build HTML
gulp.task('build-html', function(cb) {
  return runSequence(
    'combine-data',
    'compile-pug',
    'compile-html',
    cb
  );
});

// = Build JS
gulp.task('compile-js', ['jshint'], function() {
  return gulp.src(["*.js", "!_*.js"], {cwd: 'resources/assets/js'})
  .pipe($.include(options.include))
  .pipe(gulp.dest(dest + '/js'));
});

// = Build image
gulp.task('compile-images', function() {
  return gulp.src(source + "assets/images/*.*")
  .pipe(gulp.dest(dest + 'images'));
});

// = Build images name in json file
gulp.task('build-images-name', function() {
  return gulp.src(source + 'assets/images/**/*')
    .pipe(require('gulp-filelist')('filelist.json'))
    .pipe(gulp.dest('tmp'));
});

// = Build DataJson
gulp.task('combine-modules-json', function(cb) {
  return gulp.src(['**/*.json', '!**/_*.json'], {cwd: 'resources/views/modules/*/data'})
    .pipe($.mergeJson('data-json.json'))
    .pipe(gulp.dest('tmp/data'));
});

gulp.task('combine-modules-data', function(cb) {
  return gulp.src('**/*.json', {cwd: 'tmp/data'})
    .pipe($.mergeJson('data.json'))
    .pipe(gulp.dest('tmp'));
});

// Service tasks
gulp.task('combine-data', function(cb) {
  return runSequence(
    [
      'combine-modules-json'
    ],
    'combine-modules-data',
    cb
  );
});

// ================ Development
gulp.task('dev', function(cb) {
  return runSequence(
    'build',
    [
      'browser-sync',
      'build-images-name',
      'watch'
    ],
    cb
    )
});

// ================ Build
gulp.task('build', function(cb) {
  return runSequence(
    'cleanup',
    'compile-images',
    'compile-styles',
    'compile-js',
    'build-html',
    cb
    );
});
