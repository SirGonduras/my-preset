let projectFolder = "dist";
let sourceFolder = "src";
let fs = require("fs");

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
  uglify = require("gulp-uglify-es").default,
  imagemin = require("gulp-imagemin"),
  webp = require("gulp-webp"),
  webphtml = require("gulp-webp-html"),
  webpcss = require("gulp-webp-css"),
  svgSprite = require("gulp-svg-sprite"),
  ttf2woff = require("gulp-ttf2woff"),
  ttf2woff2 = require("gulp-ttf2woff2"),
  fonter = require("gulp-fonter");

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
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.less], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
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
    .pipe(webpcss())
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

function images(params) {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        interlaced: true,
        optimizationLevel: 3
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

gulp.task("otf2ttf"),
  function () {
    return src([sourceFolder + "/fonts/*.otf"])
      .pipe(
        fonter({
          formats: ["ttf"]
        })
      )
      .pipe(dest(sourceFolder + "/fonts/"));
  };

gulp.task("svgSprite", function () {
  return gulp
    .src([sourceFolder + "/iconsprite/*.svg"])
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../icons/icons.svg",
            example: true
          }
        }
      })
    )
    .pipe(dest(path.build.img));
});

function fonts(params) {
  src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
  return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}

function fontsStyle(params) {
  let file_content = fs.readFileSync(source_folder + "/less/fonts.less");
  if (file_content == "") {
    fs.writeFile(source_folder + "/less/fonts.less", "", cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split(".");
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(
              source_folder + "/less/fonts.less",
              '@include font("' +
                fontname +
                '", "' +
                fontname +
                '", "400", "normal");\r\n',
              cb
            );
          }
          c_fontname = fontname;
        }
      }
    });
  }
}

function cb() {}

let build = gulp.series(
  clean,
  gulp.parallel(js, css, html, images, fonts, fontsStyle)
);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
