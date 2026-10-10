const { execSync } = require('node:child_process');
const fs = require('node:fs');

const run = cmd => execSync(cmd, { stdio: 'inherit' });

fs.rmSync('dist', { recursive: true, force: true });
run('bunx tsc -p tsconfig.build.json');
run('bunx tailwindcss -i src/css/style.css -o dist/css/style.css --minify');
