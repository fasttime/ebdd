#!/usr/bin/env node

'use strict';

(async () =>
{
    try
    {
        const { readFile, writeFile } = require('fs/promises');

        const sinonPath = require.resolve('sinon/pkg/sinon');
        const input = await readFile(sinonPath, 'utf8');
        const output = input.replace(/\byield(?=:)/, '"yield"');
        if (input === output)
            console.log('Nothing to patch in sinon.');
        else
        {
            await writeFile(sinonPath, output);
            console.log('Patching sinon for stock browser on Android 4.0.');
        }
    }
    catch (error)
    {
        console.error(error);
        process.exitCode = 1;
    }
}
)();
