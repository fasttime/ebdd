#!/usr/bin/env node

'use strict';

const NODE_LEGACY_DIR = 'test/node-legacy';

function endOf(childProcess)
{
    const executor =
    (resolve, reject) => childProcess.on('exit', (code => code ? reject : resolve)());
    const promise = new Promise(executor);
    return promise;
}

async function npmInstall()
{
    const { spawn }                             = require('child_process');
    const { promises: { mkdir, writeFile } }    = require('fs');
    const { EOL }                               = require('os');
    const { join }                              = require('path');

    await mkdir(NODE_LEGACY_DIR, { recursive: true });
    const pkg = { dependencies: { mocha: '3.5.3', sinon: '2.4.1' }, private: true };
    const contents = JSON.stringify(pkg, null, 2) + EOL;
    const path = join(NODE_LEGACY_DIR, 'package.json');
    await writeFile(path, contents);
    const childProcess = spawn('npm', ['install'], { cwd: NODE_LEGACY_DIR, stdio: 'inherit' });
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
        await rmdir(NODE_LEGACY_DIR, { recursive: true });
        await Promise.all([tsc(), npmInstall()]);
    }
    catch (error)
    {
        console.error(error);
    }
}
)();
