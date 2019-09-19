/* eslint-env node */

'use strict';

const { dest, parallel, series, src, task } = require('gulp');

task
(
    'clean',
    async () =>
    {
        const del = require('del');

        await del(['.out', '.nyc_output', '.tmp-src', 'coverage']);
    },
);

task
(
    'lint',
    () =>
    {
        const lint = require('gulp-fasttime-lint');

        const stream =
        lint
        (
            {
                src: ['src/**/*.ts', 'test/**/*.ts'],
                parserOptions: { project: 'tsconfig.json', sourceType: 'module' },
                rules: { '@typescript-eslint/no-var-requires': 'off' },
            },
            {
                src: 'gulpfile.js',
                parserOptions: { ecmaVersion: 10 },
            },
        );
        return stream;
    },
);

task
(
    'test-no-cov',
    series
    (
        callback =>
        {
            const { fork } = require('child_process');

            const { resolve } = require;
            const tscPath = resolve('typescript/bin/tsc');
            const childProcess = fork(tscPath, ['--build', 'test/tsconfig.json']);
            childProcess.on('exit', code => callback(code && 'Test compile failed'));
        },
        callback =>
        {
            const { fork } = require('child_process');

            const mochaPath = require.resolve('mocha/bin/mocha');
            const forkArgs = ['--check-leaks', '.out/test/**/*.spec.js'];
            const childProcess = fork(mochaPath, forkArgs);
            childProcess.on('exit', code => callback(code && 'Test failed'));
        },
    ),
);

task
(
    'test',
    callback =>
    {
        const { fork } = require('child_process');

        const { resolve } = require;
        const nycPath = resolve('nyc/bin/nyc');
        const mochaPath = resolve('mocha/bin/mocha');
        const forkArgs =
        [
            '--extension=.ts',
            '--include=src',
            '--reporter=html',
            '--reporter=text-summary',
            '--',
            mochaPath,
            '--require=ts-node/register',
            '--require=source-map-support/register',
            '--check-leaks',
            'test/**/*.spec.ts',
        ];
        const forkOpts = { env: { ...process.env, TS_NODE_PROJECT: 'test/tsconfig.json' } };
        const childProcess = fork(nycPath, forkArgs, forkOpts);
        childProcess.on('exit', code => callback(code && 'Test failed'));
    },
);

task
(
    'compile',
    () =>
    {
        const ts = require('gulp-typescript');

        const tsResult = src('src/**/*.ts').pipe(ts.createProject('tsconfig.json')());
        const stream = tsResult.js.pipe(dest('.tmp-src'));
        return stream;
    },
);

async function bundle(inputPath, outputPath)
{
    const { rollup } = require('rollup');

    const inputOptions = { input: inputPath };
    const bundle = await rollup(inputOptions);
    const outputOptions =
    {
        esModule: false,
        file: outputPath,
        format: 'cjs',
    };
    await bundle.write(outputOptions);
}

task
(
    'bundle',
    () => bundle('.tmp-src/ebdd-main.js', 'ebdd.js'),
);

task('default', series(parallel('clean', 'lint'), 'test', 'compile', 'bundle'));
