#!/usr/bin/env node

import { readFile, writeFile }  from 'fs/promises';
import { createRequire }        from 'module';

const require = createRequire(import.meta.url);
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
