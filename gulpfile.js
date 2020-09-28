let projectFolder = "dist";
let sourceFolder = "src";

let path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/css/",
    js: projectFolder + "/js/",
    img: projectFolder + "/img/",
    fonts: projectFolder + "/fonts/"
  },

  src: {
    html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
    less: sourceFolder + "/less/style.less",
    js: sourceFolder + "/js/script.js",
    img: sourceFolder + "/img/**/*.{jpg, png, svg, gif, ico, webm}",
    fonts: sourceFolder + "/fonts/*.ttf"
  },

  watch: {
    html: sourceFolder + "/**/*.html",
    less: sourceFolder + "/less/**/*.less",
    js: sourceFolder + "/js/**/*.js",
    img: sourceFolder + "/img/**/*.{jpg, png, svg, gif, ico, webm}"
  },
  clean: "./" + projectFolder + "/"
};

let {src, dest} = require("gulp"),
  gulp = require("gulp"),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  less = require("gulp-less"),
  group_media = require("gulp-group-css-media-queries"),
  clean_css = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  autoprefixer = require("gulp-autoprefixer"),
  uglify = require("gulp-uglify-es").default;

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + projectFolder + "/"
    },
    port: 3000,
    notify: false
  });
}

function html(params) {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.less], css);
  gulp.watch([path.watch.js], js);
}

function clean(params) {
  return del(path.clean);
}

function css(params) {
  return src(path.src.less)
    .pipe(less())
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function js(params) {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

let build = gulp.series(clean, gulp.parallel(js, css, html));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
