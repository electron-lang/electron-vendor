const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const request = require('request');

const PACKAGES = [
  'tools-system',
  'toolchain-icestorm',
  'toolchain-iverilog'
];

const ARCHS = [
  'linux_x86_64',
  'linux_i686',
  'linux_armv7l',
  'linux_aarch64',
  'windows_x86',
  'windows_amd64',
  'darwin'
];

const ARCHDIR_LOOKUP = {
  linux_x86_64: 'linux-x64',
  linux_i686: 'linux-x32',
  linux_armv7l: 'linux-arm',
  linux_aarch64: 'linux-arm64',
  windows_x86: 'win32-x32',
  windows_amd64: 'win32-x64',
  darwin: 'darwin-x64'
};

function mkdir(dir) {
  if (!dir.startsWith('/')) {
    dir = path.join(__dirname, dir);
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
}

function getLatestVersion(repo) {
  return new Promise((resolve, reject) => {
    request({
      url: `${repo}/releases/latest`,
      followRedirect: false
    }, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(path.basename(res.headers.location).slice(1));
      }
    });
  });
}

function downloadRelease(repo, version, file, dir) {
  execSync(`wget ${repo}/releases/download/v${version}/${file} -P ${dir}`);
}

function extractTar(archive, dir) {
  execSync(`tar -xf ${archive} -C ${dir}`);
}

function downloadLatest(org, prj, arch) {
  const downloads = mkdir('downloads');
  const prebuilds = mkdir('prebuilds');
  const archdir = mkdir(path.join(prebuilds, ARCHDIR_LOOKUP[arch]));

  const repo = `https://github.com/${org}/${prj}`;
  return getLatestVersion(repo).then((version) => {
    const file = `${prj}-${arch}-${version}.tar.gz`;
    const tarFile = path.join(downloads, file);
    downloadRelease(repo, version, file, downloads);
    extractTar(tarFile, archdir);
  });
}

function downloadLatestAllArchs(org, prj, archs) {
  return Promise.all(archs.map((arch) => downloadLatest(org, prj, arch)));
}

function downloadPackages() {
  return Promise.all(PACKAGES.map((pkg) => {
    return downloadLatestAllArchs('FPGAwars', pkg, ARCHS);
  }));
}

downloadPackages();
