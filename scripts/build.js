process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

process.on('unhandledRejection', err => {
  throw err;
});

const { promisify } = require('util');
const path = require('path');
const exec = promisify(require('child_process').exec);
const fs = require('fs-extra');

async function build() {
  const root = path.resolve(__dirname, '..');
  const sourceDir = path.resolve(root, 'src');
  const targetDir = path.resolve(root, 'dist');
  const typingDir = path.resolve(root, 'typing');
  const jsTarget = targetDir;
  const cssTarget = path.resolve(targetDir, 'css');
  const excludedFolders = ['examples', 'main.jsx'].map(folder => path.join(sourceDir, folder)).join(',');

  try {
    // clean
    console.log('Cleaning...');
    await exec('npx rimraf dist');
    await exec('mkdir dist');

    // transpiling and copy js
    console.log('Transpiling js with babel...');
    await exec(`babel ${sourceDir} --out-dir ${jsTarget} --ignore "${excludedFolders}"`);

    console.log('Copying CSS Files...');
    await fs.copy(`${sourceDir}/css/`, cssTarget);

    console.log('Copying Typescript Files...');
    await fs.copy(`${typingDir}/`, targetDir);

    console.log('Copying webpack-bundled CSS (includes antd CSS)...');
    const webpackCssSource = path.resolve(root, 'dist-webpack/css/style.css');
    const webpackCssTarget = path.resolve(cssTarget, 'style.css');
    await fs.copy(webpackCssSource, webpackCssTarget);

    console.log('Success!');
  } catch (e) {
    console.error('Build process failed:', e.message);
    console.error('Stack trace:', e.stack);
    process.exit(1);
  }
}

build();
