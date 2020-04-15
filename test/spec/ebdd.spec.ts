import { ebdd }                                     from '../../src/mocha-interface';
import { ok, strictEqual }                          from 'assert';
import Mocha, { MochaGlobals, Suite, interfaces }   from 'mocha';
import { SinonSandbox, SinonSpy, createSandbox }    from 'sinon';

describe
(
    'ebdd sets up correctly',
    () =>
    {
        function test(): void
        {
            const bddSpy = sandbox.spy(interfaces, 'bdd');
            const mocha = new Mocha({ ui: 'ebdd' });
            const { suite } = mocha;
            let actualListener: SinonSpy;
            const recorder =
            function (this: Suite, event: string, listener: any): Suite
            {
                actualListener = sandbox.spy(listener);
                const suite = this.addListener(event, actualListener);
                return suite;
            };
            sandbox.stub(suite, 'on').callsFake(recorder);
            const context = { } as MochaGlobals;
            const file = '?';
            suite.emit('pre-require', context, file, mocha);
            ok(bddSpy.calledOnce);
            ok(bddSpy.calledWithExactly(suite));
            ok(actualListener!.calledOnce);
            ok(actualListener!.calledWithExactly(context, file, mocha));
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

        it
        (
            'without maxListeners',
            function ()
            {
                const { prototype } = Suite;
                if (!('getMaxListeners' in prototype && 'setMaxListeners' in prototype))
                    this.skip();
                sandbox.stub(prototype, 'getMaxListeners').value(undefined);
                sandbox.stub(prototype, 'setMaxListeners').value(undefined);
                test();
            },
        );
    },
);
