const path = require('path');
const gulp = require('gulp');
const run = require('gulp-run-command').default;
const submodule = require('gulp-git-submodule');

const dist = path.join(__dirname, 'dist');

function getOptions(mod) {
  return {
    cwd: path.join(__dirname, mod),
    env: {
      'PREFIX': dist
    }
  };
}

const yosys = getOptions('yosys');
const nextpnr = getOptions('nextpnr');
const icestorm = getOptions('icestorm');
const trellis = getOptions(path.join('prjtrellis', 'libtrellis'));
const iverilog = getOptions('iverilog');

const ICEBOX_ROOT = path.join(dist, 'share', 'icebox');

gulp.task('build:yosys:make', run('make', yosys));
gulp.task('build:yosys:make:install', ['build:yosys:make'],
          run('make install', yosys));
gulp.task('build:yosys', ['build:yosys:make:install'], () => {
  console.log('build:yosys');
});

gulp.task('build:nextpnr:cmake', ['build:icestorm'],
          run(`cmake -DARCH=ice40 -DICEBOX_ROOT=${ICEBOX_ROOT} -DCMAKE_INSTALL_PREFIX=${dist} .`, nextpnr));
gulp.task('build:nextpnr:make', ['build:nextpnr:cmake'],
          run('make -j 4', nextpnr));
gulp.task('build:nextpnr:make:install', ['build:nextpnr:make'],
          run('make install', nextpnr));
gulp.task('build:nextpnr', ['build:nextpnr:make:install'], () => {
  console.log('build:nextpnr');
});

gulp.task('build:icestorm:make', run('make', icestorm));
gulp.task('build:icestorm:make:install', run('make install', icestorm));
gulp.task('build:icestorm', ['build:icestorm:make:install'], () => {
  console.log('build:icestorm');
});


gulp.task('build:trellis:cmake', run('cmake .', trellis));
gulp.task('build:trellis:make', ['build:trellis:cmake'], run('make', trellis));
gulp.task('build:trellis', ['build:trellis:make'], () => {
  console.log('build:trellis');
});

gulp.task('build:iverilog:autoconf',
          run('sh autoconf.sh', iverilog));
gulp.task('build:iverilog:configure', ['build:iverilog:autoconf'],
          run(`./configure --prefix=${dist}`, iverilog));
gulp.task('build:iverilog:make', ['build:iverilog:configure'],
          run('make', iverilog));
gulp.task('build:iverilog:make:install', ['build:iverilog:make'],
          run('make install', iverilog));
gulp.task('build:iverilog', ['build:iverilog:make:install'], () => {
  console.log('build:iverilog');
});

gulp.task('build', ['build:yosys', 'build:nextpnr', 'build:iverilog'], () => {
  console.log('build');
});

submodule.registerTasks(gulp);
