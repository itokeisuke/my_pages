var gulp = require('gulp');
var pug = require('gulp-pug');
var sass = require('gulp-sass');
var fs = require('fs');
var data = require('gulp-data');
var path = require('path');
var plumber = require('gulp-plumber');
var notify = require("gulp-notify");
var autoprefixer = require( 'gulp-autoprefixer' );
var rename = require( 'gulp-rename' );
var browserSync = require('browser-sync');

/**
 * 開発用のディレクトリを指定します。
 */
var src = {
  // 出力対象は`_`で始まっていない`.pug`ファイル。
  'html': ['src/**/*.pug', '!' + 'src/**/_*.pug'],
  // JSONファイルのディレクトリを変数化。
  'json': 'src/_data/',
  'sass': 'src/**/*.scss',
  'js': 'src/**/*.js',
};

/**
 * 出力するディレクトリを指定します。
 */
var dest = {
  'root': 'docs/',
  'sass': '/../css',
};

/**
 * `.pug`をコンパイルしてから、destディレクトリに出力します。
 * JSONの読み込み、ルート相対パス、Pugの整形に対応しています。
 */
gulp.task('html', function() {
  // JSONファイルの読み込み。
  var locals = {
    'site': JSON.parse(fs.readFileSync(src.json + 'site.json'))
  }
  return gulp.src(src.html)
  // コンパイルエラーを通知します。
  .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
  // 各ページごとの`/`を除いたルート相対パスを取得します。
  .pipe(data(function(file) {
    locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.html'));
      return locals;
  }))
  .pipe(pug({
    // JSONファイルとルート相対パスの情報を渡します。
    locals: locals,
    // Pugファイルのルートディレクトリを指定します。
    // `/_includes/_layout`のようにルート相対パスで指定することができます。
    basedir: 'src',
    // Pugファイルの整形。
    pretty: true
  }))
  .pipe(gulp.dest(dest.root))
  .pipe(browserSync.reload({stream: true}));
});

/**
 * scssファイルをdestディレクトリに出力します。
 */
gulp.task('sass', function() { // build:scss というタスクを登録
  gulp.src(src.sass, {base: src.root}) // コンパイルする scss の場所
  .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")})) // コンパイルエラーを通知します。
	.pipe(autoprefixer())
  .pipe(sass()) // gulp-sass で変換
  .pipe(rename(function(path) {
          path.dirname += dest.sass;
  }))
  .pipe(gulp.dest(dest.root)); // コンパイルした scss を指定場所に出力
});

/**
 * ローカルサーバーを起動します。
 */
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: dest.root,
      index: "index.html"
    }
  });
});

/**
 * PugのコンパイルやSCSSとjsの出力、browser-syncのリアルタイムプレビューを実行します。
 */
gulp.task('watch', ['html', 'sass', 'browser-sync'], function() {
  gulp.watch(src.html, ['html']);
  gulp.watch(src.sass, ['sass']);
});

/**
 * 開発に使うタスクです。
 * package.jsonに設定をして、`npm run default`で実行できるようにしています。
 */
gulp.task('default', ['watch']);
