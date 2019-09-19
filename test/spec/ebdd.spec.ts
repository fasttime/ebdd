import { MochaConstructor, createInterface, initEBDD }  from '../../src/mocha-interface';
import { deepStrictEqual, ok }                          from 'assert';
import { Suite, interfaces }                            from 'mocha';
import { restore, stub }                                from 'sinon';

describe
(
    'ebdd',
    () =>
    {
        after(() => restore());

        it
        (
            'sets up correctly',
            () =>
            {
                const mochaConstructor: MochaConstructor = { Suite, interfaces } as any;
                const bdd = stub(interfaces, 'bdd');
                initEBDD(mochaConstructor);
                const { ebdd } =
                interfaces as typeof interfaces & { ebdd: (suite: Suite) => void; };
                const suite = new Suite('abc');
                ebdd(suite);
                ok(bdd.calledOnceWithExactly(suite));
                const listeners = suite.listeners('pre-require');
                deepStrictEqual(listeners, [createInterface]);
            },
        );
    },
);
