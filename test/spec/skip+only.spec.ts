import { EBDDGlobals, ParamInfo, createInterface }  from '../../src/mocha-interface';
import { throws }                                   from 'assert';

describe
(
    'skip & only',
    () =>
    {
        let only:   <ParamType>(param: ParamType) => ParamInfo<ParamType>;
        let skip:   <ParamType>(param: ParamType) => ParamInfo<ParamType>;
        let testIf: <ParamType>(condition: boolean, param: ParamType) => ParamInfo<ParamType>;

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
            'skip(testIf(true, ...))',
            () => throws(() => skip(testIf(true, { }))),
        );

        it
        (
            'skip(testIf(false, ...))',
            () => throws(() => skip(testIf(false, { }))),
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

        it
        (
            'only(testIf(true, ...))',
            () => throws(() => only(testIf(true, { }))),
        );

        it
        (
            'only(testIf(false, ...))',
            () => throws(() => only(testIf(false, { }))),
        );

        it
        (
            'testIf(true, skip(...))',
            () => throws(() => testIf(true, skip({ }))),
        );

        it
        (
            'testIf(true, only(...))',
            () => throws(() => testIf(true, only({ }))),
        );

        it
        (
            'testIf(true, testIf(true, ...))',
            () => throws(() => testIf(true, testIf(true, { }))),
        );

        it
        (
            'testIf(true, testIf(false, ...))',
            () => throws(() => testIf(true, testIf(false, { }))),
        );

        it
        (
            'testIf(false, skip(...))',
            () => throws(() => testIf(false, skip({ }))),
        );

        it
        (
            'testIf(false, only(...))',
            () => throws(() => testIf(false, only({ }))),
        );

        it
        (
            'testIf(false, testIf(true, ...))',
            () => throws(() => testIf(false, testIf(true, { }))),
        );

        it
        (
            'testIf(false, testIf(false, ...))',
            () => throws(() => testIf(false, testIf(false, { }))),
        );
    },
);
