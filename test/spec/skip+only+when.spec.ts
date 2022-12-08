import type { ParamInfo }       from '../../src/ebdd';
import { EMPTY_OBJ, loadEBDD }  from './utils';
import { throws }               from 'assert';

describe
(
    'skip, only and when',
    (): void =>
    {
        let only: <ParamType>(param: ParamType) => ParamInfo<ParamType>;
        let skip: <ParamType>(param: ParamType) => ParamInfo<ParamType>;
        let when: <ParamType>(condition: boolean, param: ParamType) => ParamInfo<ParamType>;

        beforeEach
        (
            (): void =>
            {
                ({ only, skip } = loadEBDD());
            },
        );

        after
        (
            (): void =>
            {
                ({ only, skip } = EMPTY_OBJ);
            },
        );

        it('skip(skip(...))', (): void => throws((): unknown => skip(skip({ }))));

        it('skip(only(...))', (): void => throws((): unknown => skip(only({ }))));

        it('skip(when(true, ...))', (): void => throws((): unknown => skip(when(true, { }))));

        it('skip(when(false, ...))', (): void => throws((): unknown => skip(when(false, { }))));

        it('only(skip(...))', (): void => throws((): unknown => only(skip({ }))));

        it('only(only(...))', (): void => throws((): unknown => only(only({ }))));

        it('only(when(true, ...))', (): void => throws((): unknown => only(when(true, { }))));

        it('only(when(false, ...))', (): void => throws((): unknown => only(when(false, { }))));

        it('when(true, skip(...))', (): void => throws((): unknown => when(true, skip({ }))));

        it('when(true, only(...))', (): void => throws((): unknown => when(true, only({ }))));

        it
        (
            'when(true, when(true, ...))',
            (): void => throws((): unknown => when(true, when(true, { }))),
        );

        it
        (
            'when(true, when(false, ...))',
            (): void => throws((): unknown => when(true, when(false, { }))),
        );

        it('when(false, skip(...))', (): void => throws((): unknown => when(false, skip({ }))));

        it('when(false, only(...))', (): void => throws((): unknown => when(false, only({ }))));

        it
        (
            'when(false, when(true, ...))',
            (): void => throws((): unknown => when(false, when(true, { }))),
        );

        it
        (
            'when(false, when(false, ...))',
            (): void => throws((): unknown => when(false, when(false, { }))),
        );
    },
);
