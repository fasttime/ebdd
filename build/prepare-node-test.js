#!/usr/bin/env node

'use strict';

function endOf(childProcess)
{
    const executor =
    (resolve, reject) => childProcess.on('exit', (code => code ? reject : resolve)());
    const promise = new Promise(executor);
    return promise;
}

async function npm()
{
    const { spawn }                             = require('child_process');
    const { promises: { mkdir, writeFile } }    = require('fs');
    const { EOL }                               = require('os');

    await mkdir('node-test', { recursive: true });
    const pkg = { private: true, dependencies: { mocha: '3.5.3', sinon: '2.4.1' } };
    const contents = JSON.stringify(pkg, null, 2) + EOL;
    await writeFile('node-test/package.json', contents);
    const childProcess = spawn('npm', ['install'], { cwd: 'node-test', stdio: 'inherit' });
    await endOf(childProcess);
}

async function tsc()
{
    const { fork } = require('child_process');

    const tscPath = require.resolve('typescript/bin/tsc');
    const childProcess = fork(tscPath, ['--build', 'test/tsconfig.json']);
    await endOf(childProcess);
}

(async () =>
{
    try
    {
        const { promises: { rmdir } }   = require('fs');
        const { dirname }               = require('path');

        process.chdir(dirname(__dirname));
        await rmdir('node-test', { recursive: true });
        await Promise.all([tsc(), npm()]);
    }
    catch (error)
    {
        console.error(error);
    }
}
)();
