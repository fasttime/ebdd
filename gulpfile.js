'use strict';

const { dest, parallel, series, src, task } = require('gulp');

task
(
    'clean',
    async () =>
    {
        const { promises: { rmdir } } = require('fs');

        const paths =
        [
            '.nyc_output',
            '.tmp-out',
            'coverage',
            'ebdd.js',
            'lib',
            'test/browser-spec-runner.js',
            'test/node-legacy',
        ];
        const options = { recursive: true };
        await Promise.all(paths.map(path => rmdir(path, options)));
    },
);

task
(
    'lint',
    () =>
    {
        const lint = require('@fasttime/gulp-lint');

        const stream =
        lint
        (
            {
                src: ['src/**/*.ts', 'test/*.ts', 'test/spec/**/*.ts'],
                parserOptions: { project: 'tsconfig.json', sourceType: 'module' },
            },
            {
                src: ['test/*.js', '!test/browser-spec-runner.js'],
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
            '--include=src',
            '--reporter=html',
            '--reporter=text-summary',
            mochaPath,
            '--check-leaks',
            '--require=ts-node/register',
            'test/spec/**/*.spec.ts',
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
        const { include }       = require('gulp-ignore');
        const gulpRename        = require('gulp-rename');
        const { createProject } = require('gulp-typescript');
        const mergeStream       = require('merge-stream');

        const { dts, js } =
        src(['{src,test}/**/*.ts', '!test/node-legacy/**']).pipe(createProject('tsconfig.json')());
        const condition = ['src/ebdd.d.ts', 'src/extensible-array.d.ts'];
        const stream =
        mergeStream
        (
            dts.pipe(include(condition)).pipe(gulpRename({ dirname: '' })).pipe(dest('lib')),
            js.pipe(dest('.tmp-out')),
        );
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
        const { nodeResolve }       = require('@rollup/plugin-node-resolve');
        const cleanup               = require('rollup-plugin-cleanup');

        const inputOptions =
        {
            input: '.tmp-out/src/main.js',
            plugins: [cleanup({ comments: /^(?!\*!)/, maxEmptyLines: -1 }), nodeResolve()],
        };
        const outputOptions = { banner: `// EBDD ${version} – ${homepage}\n`, file: 'ebdd.js' };
        await bundle(inputOptions, outputOptions);
    },
);

task
(
    'bundle:test',
    async () =>
    {
        const { nodeResolve }   = require('@rollup/plugin-node-resolve');
        const builtins          = require('rollup-plugin-node-builtins');
        const globals           = require('rollup-plugin-node-globals');

        const inputOptions =
        {
            external: ['mocha', 'sinon'],
            input: '.tmp-out/test/browser-spec-runner.js',
            plugins: [builtins(), globals({ buffer: false }), nodeResolve()],
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
