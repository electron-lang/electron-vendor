#!/usr/bin/env node

const path = require('path');
const { execSync } = require('child_process');

const binName = path.basename(process.argv[1]);
const args = process.argv.slice(2);
const archdir = `${process.platform}-${process.arch}`;
const bin = path.join('__dirname', '..', 'prebuilds', archdir, 'bin', binName);

execSync(`${bin} ${args.join(' ')}`, { stdio: [ 0, 1, 2 ] });
