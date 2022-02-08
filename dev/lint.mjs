#!/usr/bin/env node

import { lint }             from './impl.mjs';
import { fileURLToPath }    from 'url';

const pkgPath = fileURLToPath(new URL('..', import.meta.url));
process.chdir(pkgPath);
await lint();
