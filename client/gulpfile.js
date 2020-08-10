var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var ts = require("gulp-typescript");
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var tsProject = ts.createProject("tsconfig.json");
var del = require('del');
var sass = require('gulp-sass');
sass.compiler = require('node-sass');

gulp.task("scripts", function () {
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js.pipe(sourcemaps.write())
        .pipe(gulp.dest("build"));
});

gulp.task('clean', function () {
    return del([
        "build/**",
        "dist/**"
    ]);
});

gulp.task("copy-html", function () {
    return gulp.src('html/index.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('sass', function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'));
});

gulp.task("copy-assets", function() {
    return gulp.src(["assets/**/*"])
        .pipe(gulp.dest("dist/assets"));
});

gulp.task("copy-fonts", function() {
    return gulp.src(["assets/fonts/**/*"])
        .pipe(gulp.dest("dist/fonts"));
});
 
gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

// gulp.task("css", function() {
//     return gulp.src('css/*.css')
//         .pipe(gulp.dest('dist'));
// });

gulp.task('compile-dev', gulp.series(['scripts'], function () {
    var b = browserify({
        entries: 'build/app.js',
        debug: true
    });

    return b.bundle()
        .pipe(source('out.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
}));


gulp.task("watch", function() {
    gulp.watch('{src,html,css,sass}/**/*', gulp.series(['build-dev']));
});


gulp.task('compile', gulp.parallel(['scripts'], function () {
    var b = browserify({
        entries: 'build/main.js',
        debug: false
    });

    return b.bundle()
        .pipe(source('out.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
}));

// gulp.task('build-dev', gulp.series(['copy-html', 'sass', 'css', 'compile-dev']));
// gulp.task('build', gulp.series(['copy-html', 'sass', 'css', 'compile']));

gulp.task('build-dev', gulp.parallel(['copy-html', 'copy-assets', 'copy-fonts', 'sass', 'compile-dev']));
gulp.task('build', gulp.parallel(['copy-html', 'copy-assets', 'copy-fonts', 'sass', 'compile']));