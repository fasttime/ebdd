mocha.setup({ checkLeaks: true, reporter: MochaBar, ui: 'bdd' });
addEventListener
(
    'DOMContentLoaded',
    (): void =>
    {
        mocha.run();
    },
);
