/* eslint-env browser */
/* global mocha */

import type { }                     from '../src/ebdd';
import type { ReporterConstructor } from 'mocha';

declare global
{
    const MochaBar: ReporterConstructor;
}

mocha.setup({ checkLeaks: true, reporter: MochaBar, ui: 'bdd' });
addEventListener
(
    'DOMContentLoaded',
    () =>
    {
        mocha.run();
    },
);
