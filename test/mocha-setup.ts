/* eslint-env browser */
/* global mocha */

declare global
{
    const MochaBar: ReporterConstructor;
}

mocha.setup({ ignoreLeaks: false, reporter: MochaBar, ui: 'bdd' });
addEventListener
(
    'DOMContentLoaded',
    () =>
    {
        mocha.run();
    },
);

export { };
