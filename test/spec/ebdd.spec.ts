import { createInterface, initEBDD }    from '../../src/mocha-interface';
import { deepStrictEqual, ok }          from 'assert';
import { Suite, interfaces }            from 'mocha';
import { restore, stub }                from 'sinon';

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
                const bdd = stub(interfaces, 'bdd');
                initEBDD({ interfaces });
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
