const { CLIEngine } = require('eslint');
const { execSync } = require('child_process');
const cli = new CLIEngine({});

/**
 *  * Because shellcheck script might not exist, check first if it does.
 *   * If it doesn't, provide an empty function for shell scripts linting
 *    */
let shellcheck;
try {
  execSync('command -v shellcheck >/dev/null 2>&1');
  shellcheck = files => files.map(file => `shellcheck "${file}"`);
} catch (e) {
  shellcheck = _files => [];
}

module.exports = {
  '**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit',

  // equivalent globs for the same set of files, execute in parallel
  '*.{js,jsx,ts,tsx,PARALLEL_1}': files =>
    `eslint --report-unused-disable-directives --max-warnings=0 ${files
      .filter(file => !cli.isPathIgnored(file))
      .map(f => `"${f}"`)
      .join(' ')}`,

  '*.sh': shellcheck,
  'bin/*': shellcheck,

  '*.{js,ts,jsx,tsx,css,md,mdx,scss}': 'prettier --write',
};
