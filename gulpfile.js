var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rigger = require('gulp-rigger'),
    sass = require('gulp-sass'),
    notify = require("gulp-notify"),
    rename = require('gulp-rename'),
    gcmq = require('gulp-group-css-media-queries'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    spritesmith = require('gulp.spritesmith'),
    browserSync = require('browser-sync'),
    watch = require('gulp-watch'),
    imagemin = require('gulp-imagemin');

var path = {
    build: { // Куда складывать готовые файлы после сборки
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/images/',
        fonts: 'dist/fonts/'
    },
    src: { // Откуда брать исходники
        html: 'app/*.html',
        js: 'app/js/*.js',
        css: 'app/css/main.scss',
        img: 'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    watch: { // За изменениями каких файлов мы хотим наблюдать
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        css: 'app/sass/**/*.scss',
        img: 'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    clean: './dist'
};


gulp.task('browser-sync', function () {
    browserSync.init({ // Выполняем browserSync
        // server: { // Определяем параметры сервера
        // 	baseDir: 'dist' // Директория для сервера - app
        // },
         proxy: "templatehtml.loc", // Прокси для Open Server
        notify: false // Отключаем уведомления
    });
});

gulp.task('html:build', function () {
    gulp.src(path.src.html) // Выберем файлы по нужному пути
        .pipe(rigger()) // Прогоним через rigger
        .pipe(gulp.dest(path.build.html)); // Переместим их в папку build
});

gulp.task('sass:build', function () {
    return gulp.src('app/sass/**/*.+(sass|scss)')
        .pipe(sass().on("error", notify.onError()))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(gcmq())// Преобразуем медиа-запросы
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS()) // Опционально, закомментировать при отладке
        .pipe(gulp.dest('dist/css'))
});

// gulp.task('css', function () {
//     return gulp.src('app/css/**/*')
//         .pipe(gulp.dest('dist/css'))
// });

gulp.task('js:build', function () {
    gulp.src(path.src.js) // Выберем файлы по нужному пути
        .pipe(rigger()) // Прогоним через rigger
        .pipe(uglify()) // Сожмем js
        .pipe(gulp.dest(path.build.js)); // Переместим готовый файл в build
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) // Выберем наши картинки
        .pipe(imagemin({ // Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)); // Переместим в build
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts)) // Переместим шрифты в build
});

gulp.task('sprite', function () {
    var spriteData = gulp.src('app/icons/*.png')
        .pipe(spritesmith({
            imgName: '../images/sprite.png',
            cssName: 'sprite.scss'
        }));
    return spriteData.pipe(gulp.dest('app/sprites/'));
});

gulp.task('build', [
    'html:build',
    'js:build',
    'sass:build',
    'image:build',
    'fonts:build',
    // 'css'
]);

gulp.task('watch', ['build', 'browser-sync'], function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build', browserSync.reload);

    });

    watch([path.watch.css], function(event, cb) {
        gulp.start('sass:build', browserSync.reload);
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build', browserSync.reload);
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build', browserSync.reload);
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build', browserSync.reload);
    });

});

gulp.task('default', ['watch']);