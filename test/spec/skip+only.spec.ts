import { EBDDGlobals, ParamInfo, createInterface }  from '../../src/mocha-interface';
import { throws }                                   from 'assert';

describe
(
    'skip & only',
    () =>
    {
        let only: <ParamType>(param: ParamType) => ParamInfo<ParamType>;
        let skip: <ParamType>(param: ParamType) => ParamInfo<ParamType>;

        beforeEach
        (
            () =>
            {
                const ebdd = { } as EBDDGlobals;
                createInterface(ebdd);
                ({ only, skip } = ebdd);
            },
        );

        after
        (
            () =>
            {
                const ebdd = { } as EBDDGlobals;
                ({ only, skip } = ebdd);
            },
        );

        it
        (
            'skip(skip(...))',
            () => throws(() => skip(skip({ }))),
        );

        it
        (
            'skip(only(...))',
            () => throws(() => skip(only({ }))),
        );

        it
        (
            'only(skip(...))',
            () => throws(() => only(skip({ }))),
        );

        it
        (
            'only(only(...))',
            () => throws(() => only(only({ }))),
        );
    },
);
