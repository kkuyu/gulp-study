const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const htmlvalidator = require('gulp-w3c-html-validation');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const uglifyJS = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');
const imagemin = require('gulp-imagemin');
// const imageminJpegtran = require('imagemin-jpegtran');
// const imageminPngquant = require('imagemin-pngquant');
const del = require('del');

const server = () => {
	browserSync.init({
		server: {
			baseDir: 'dist',
		},
		// browser: ["chrome", "firefox"]
	});
}

const html = () => {
	return gulp
		.src('source/**/*.html', {since: gulp.lastRun(html)})
		.pipe(htmlvalidator({generateReport: false}))
		.pipe(gulp.dest('dist'))
		.on('end', () => {
			return del('w3cErrors');
		})
}

const css = () => {
	return gulp
		.src('source/css/**/*.css', {since: gulp.lastRun(css)})
		.pipe(postcss([ autoprefixer, cssnano ]))
		.pipe(gulp.dest('dist/css'))
}

const scss = () => {
	return gulp
		.src('source/sass/**/*.scss', {since: gulp.lastRun(scss)})
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(postcss([ autoprefixer ]))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/css'))
}

const sprite = () => {
	const spriteData = gulp.src('source/images/sprite/*.{png,jpg,gif}', {since: gulp.lastRun(sprite)})
		.pipe(spritesmith({
			imgName: 'sprite.png',
			cssName: '_sprite.scss',
			padding: 8,
		}))

	const imgStream = spriteData.img
		.pipe(gulp.dest('dist/images'))

	const cssStream = spriteData.css
		.pipe(gulp.dest('source/sass'))

	return merge(imgStream, cssStream);
}

const image = () => {
	return gulp
		.src(['source/images/**', '!source/images/sprite/**'], {since: gulp.lastRun(image)})
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 5})
		]))
		.pipe(gulp.dest('dist/images'))
}

const js = () => {
	return gulp
		.src('source/js/**/*.js', {since: gulp.lastRun(js)})
		.pipe(sourcemaps.init())
		.pipe(uglifyJS())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/js'))
}

const clean = (done) => {
	return (async () => {
		let a = await del('dist');
		done();
	})();
	// return (() => {
	// 	del.sync('dist');
	// 	return done();
	// })()
}

const watchTask = () => {
	gulp
		.watch('source/**/*.html', html)
		.on('change', browserSync.reload);
	gulp
		.watch('source/css/**/*.css', css)
		.on('change', browserSync.reload);
	gulp
		.watch('source/sass/**/*.scss', scss)
		.on('change', browserSync.reload);
	gulp
		.watch('source/images/sprite/*.{png,jpg,gif}', sprite)
		.on('change', browserSync.reload);
	gulp
		.watch(['source/images/**', '!source/images/sprite/**'], image)
		.on('change', browserSync.reload);
	gulp
		.watch('source/js/**/*.js', js)
		.on('change', browserSync.reload);
}

// exports.clean = clean;
exports.build = gulp.series(
	clean,
	gulp.parallel(html, css, scss, sprite, image, js),
);

exports.default = gulp.series(
	clean,
	gulp.parallel(html, css, scss, sprite, image, js),
	gulp.parallel(server, watchTask),
);