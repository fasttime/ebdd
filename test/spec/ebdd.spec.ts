import { ebdd }                                     from '../../src/mocha-interface';
import { ok, strictEqual }                          from 'assert';
import Mocha, { MochaGlobals, Suite, interfaces }   from 'mocha';
import { SinonSandbox, SinonSpy, createSandbox }    from 'sinon';

describe
(
    'ebdd sets up correctly',
    () =>
    {
        function test(mocha: Mocha = new Mocha(), ebddThis?: Mocha): void
        {
            const { suite } = mocha;
            suite.removeAllListeners();
            ebdd.call(ebddThis, suite);
            const listeners = suite.listeners('pre-require');

            strictEqual(listeners.length, 1);

            let bddPreRequireListener: SinonSpy;
            sandbox.stub(suite, 'on').callsFake
            (
                function (this: Suite, event: string, listener: any): Suite
                {
                    bddPreRequireListener = sandbox.spy(listener);
                    const suite = this.addListener(event, bddPreRequireListener);
                    return suite;
                },
            );
            const bddSpy = sandbox.spy(interfaces, 'bdd');
            const context = { } as MochaGlobals;
            const file = '?';
            suite.emit('pre-require', context, file, mocha);

            ok(bddSpy.calledOnce);
            ok(bddSpy.calledWithExactly(suite));
            ok(bddPreRequireListener!.calledOnce);
            ok(bddPreRequireListener!.calledWithExactly(context, file, mocha));
            strictEqual(typeof context.only, 'function');
            strictEqual(typeof context.skip, 'function');
            strictEqual(typeof context.when, 'function');
        }

        let sandbox: SinonSandbox;

        beforeEach
        (
            () =>
            {
                interfaces.ebdd = ebdd;
                sandbox = createSandbox();
            },
        );

        afterEach(() => sandbox.restore());

        after
        (
            () =>
            {
                delete interfaces.ebdd;
                sandbox = null as any;
            },
        );

        it
        (
            'normally',
            () =>
            {
                test();
            },
        );

        // getMaxListeners is not available in Node.js < 1.
        describe
        (
            'without getMaxListeners',
            () =>
            {
                it
                (
                    'with _maxListeners not set',
                    function ()
                    {
                        const { prototype } = Suite;
                        if (!('getMaxListeners' in prototype))
                            this.skip();
                        sandbox.stub(prototype, 'getMaxListeners').value(undefined);
                        const mocha = new Mocha();
                        delete (mocha.suite as { _maxListeners?: number; })._maxListeners;
                        test(mocha);
                    },
                );

                it
                (
                    'with _maxListeners set',
                    function ()
                    {
                        const { prototype } = Suite;
                        if (!('getMaxListeners' in prototype))
                            this.skip();
                        sandbox.stub(prototype, 'getMaxListeners').value(undefined);
                        const mocha = new Mocha();
                        mocha.suite.setMaxListeners(10);
                        test(mocha);
                    },
                );
            },
        );

        // In older versions of Mocha, the test UI function is called with the Mocha object as this.
        // This behavior has changhed in Mocha 6.0.1.
        // With newer versions, the Mocha object is not known until the pre-require callback runs.
        it
        (
            'when called on Mocha object',
            () =>
            {
                const mocha = new Mocha();
                test(mocha, mocha);
            },
        );
    },
);
