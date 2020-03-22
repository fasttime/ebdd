/* eslint-env browser */
/* global mocha */

mocha.setup({ checkLeaks: true, reporter: MochaBar, ui: 'bdd' });
addEventListener
(
    'DOMContentLoaded',
    () =>
    {
        mocha.run();
    },
);
