'use strict';

const { dest, parallel, series, src, task } = require('gulp');

task
(
    'clean',
    async () =>
    {
        const del = require('del');

        const patterns =
        ['.nyc_output', '.tmp-src', 'coverage', 'ebdd.js', 'test/browser-spec-runner.js'];
        await del(patterns);
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
                src: '{src,test}/**/*.ts',
                parserOptions: { project: 'tsconfig.json', sourceType: 'module' },
            },
            {
                src: ['test/**/*.js', '!test/browser-spec-runner.js'],
            },
            {
                src: ['build/**/*.js', 'gulpfile.js'],
                envs: 'node',
                parserOptions: { ecmaVersion: 11 },
            },
        );
        return stream;
    },
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
        const { createProject } = require('gulp-typescript');

        const tsResult = src('{src,test}/**/*.ts').pipe(createProject('tsconfig.json')());
        const stream = tsResult.js.pipe(dest('.tmp-src'));
        return stream;
    },
);

async function bundle(inputOptions, outputOptions)
{
    const { rollup } = require('rollup');

    inputOptions =
    {
        ...inputOptions,
        onwarn(warning)
        {
            if (warning.code !== 'THIS_IS_UNDEFINED')
                console.error(warning.message);
        },
    };
    const bundle = await rollup(inputOptions);
    outputOptions = { ...outputOptions, esModule: false, format: 'iife' };
    await bundle.write(outputOptions);
}

task
(
    'bundle:src',
    async () =>
    {
        const { homepage, version } = require('./package.json');

        const inputOptions = { input: '.tmp-src/src/ebdd-main.js' };
        const outputOptions = { banner: `// EBDD ${version} – ${homepage}\n`, file: 'ebdd.js' };
        await bundle(inputOptions, outputOptions);
    },
);

task
(
    'bundle:test',
    async () =>
    {
        const builtins  = require('rollup-plugin-node-builtins');
        const globals   = require('rollup-plugin-node-globals');

        const inputOptions =
        {
            external: ['mocha', 'sinon'],
            input: '.tmp-src/test/browser-spec-runner.js',
            plugins: [builtins(), globals({ buffer: false })],
        };
        const outputOptions =
        {
            file: 'test/browser-spec-runner.js',
            globals: { assert: 'assert', mocha: 'Mocha', sinon: 'sinon' },
        };
        await bundle(inputOptions, outputOptions);
    },
);

task
(
    'default',
    series(parallel('clean', 'lint'), 'test', 'compile', parallel('bundle:src', 'bundle:test')),
);
