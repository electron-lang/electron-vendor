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
const trellis = getOptions('prjtrellis');
const libtrellis = getOptions(path.join('prjtrellis', 'libtrellis'));
const iverilog = getOptions('iverilog');

const ICEBOX_ROOT = path.join(dist, 'share', 'icebox');
const TRELLIS_ROOT = path.join(dist, 'share', 'trellis');

const DPREFIX = '-DCMAKE_INSTALL_PREFIX=' + dist;
const DARCH = '-DARCH=all';
const DICEBOX_ROOT = '-DICEBOX_ROOT=' + ICEBOX_ROOT;
const DTRELLIS_ROOT = '-DTRELLIS_ROOT=' + TRELLIS_ROOT;

gulp.task('build:yosys:make', run('make', yosys));
gulp.task('build:yosys:make:install', ['build:yosys:make'],
          run('make install', yosys));
gulp.task('build:yosys', ['build:yosys:make:install'], () => {
  console.log('build:yosys');
});

gulp.task('build:nextpnr:cmake', ['build:icestorm', 'build:trellis'],
          run(`cmake ${DPREFIX} ${DARCH} ${DICEBOX_ROOT} ${DTRELLIS_ROOT} .`, nextpnr));
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


gulp.task('build:trellis:db', run('./download-latest-db.sh', trellis));
gulp.task('build:trellis:cmake', ['build:trellis:db'],
          run(`cmake -DCMAKE_INSTALL_PREFIX=${dist} .`, libtrellis));
gulp.task('build:trellis:make', ['build:trellis:cmake'],
          run('make', libtrellis));
gulp.task('build:trellis:make:install', ['build:trellis:make'],
          run('make install', libtrellis));
gulp.task('build:trellis', ['build:trellis:make:install'], () => {
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

// trellis and nextpnr fail to build due to boost
gulp.task('build', ['build:yosys', 'build:icestorm', 'build:iverilog'], () => {
  console.log('build');
});

submodule.registerTasks(gulp);
