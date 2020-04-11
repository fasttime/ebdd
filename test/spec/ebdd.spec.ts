import { createInterface, ebdd }    from '../../src/mocha-interface';
import { deepStrictEqual, ok }      from 'assert';
import Mocha, { Suite, interfaces } from 'mocha';
import { restore, stub }            from 'sinon';

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
                const mocha = new Mocha();
                const bdd = stub(interfaces, 'bdd');
                const suite = new Suite('abc');
                ebdd.call(mocha, suite);
                ok(bdd.calledOnceWithExactly(suite));
                const listeners = suite.listeners('pre-require');
                deepStrictEqual(listeners, [createInterface]);
            },
        );
    },
);
