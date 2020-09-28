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
    html: sourceFolder + "/*.html",
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
  fileinclude = require("gulp-file-include");

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
}

let build = gulp.series(html);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
