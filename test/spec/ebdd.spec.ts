import { ebdd }                                     from '../../src/mocha-interface';
import { ok, strictEqual }                          from 'assert';
import Mocha, { MochaGlobals, Suite, interfaces }   from 'mocha';
import { SinonSandbox, createSandbox }              from 'sinon';

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
            const context = { } as MochaGlobals;
            suite.emit('pre-require', context, '', mocha);
            ok(bddSpy.calledOnce);
            ok(bddSpy.calledWithExactly(suite));
            strictEqual(typeof context.only, 'function');
        }

        let sandbox: SinonSandbox;

        beforeEach
        (
            () =>
            {
                Mocha.interfaces.ebdd = ebdd;
                sandbox = createSandbox();
            },
        );

        afterEach(() => sandbox.restore());

        after
        (
            () =>
            {
                delete Mocha.interfaces.ebdd;
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
