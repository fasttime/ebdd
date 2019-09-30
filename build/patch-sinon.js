#!/usr/bin/env node

'use strict';

(async () =>
{
    const { promises: { readFile, writeFile } } = require('fs');

    const sinonPath = require.resolve('sinon/pkg/sinon');
    const input = (await readFile(sinonPath)).toString();
    const output = input.replace(/\byield(?=:)/, '"yield"');
    if (input === output)
        console.log('Nothing to patch in sinon.');
    else
    {
        await writeFile(sinonPath, output);
        console.log('Patching sinon for stock browser on Android 4.0.');
    }
}
)();
