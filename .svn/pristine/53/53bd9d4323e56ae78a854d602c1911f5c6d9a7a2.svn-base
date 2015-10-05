'use strict';

module.exports = function (grunt) {
	
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.initConfig({
		watch: {
			js: {
				files: ['assets/js/**/*.js'],
				options: {
					livereload: '<%= connect.options.livereload %>'
				}
			},
			sass: {
				files: ['assets/css/sass/**/*.scss'],
				tasks: ['sass']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'./**/*.html',
					'./assets/css/**/*.css',
					'./assets/img/**/*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		},

		connect: {
			options: {
				port: 9000,
				//Change this to '0.0.0.0' to access the server from outside.
				hostname: 'localhost',
				livereload: 35729
			},
			livereload: {
				options: {
					open: true,
					middleware: function (connect) {
						return [
							connect.static('./')
						];
					}
				}
			}
		},

		sass: {
			options: {
				sourceMap: true
			},
			dist: {
				files: {
					'./assets/css/screen-main.css': './assets/css/sass/screen-main.scss'
				}
			}
		},

		concurrent: {
			server: [
				'sass'
			]
		}
	});

	grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
		grunt.task.run([
			'concurrent:server',
			'connect:livereload',
			'watch'
		]);
	});
};