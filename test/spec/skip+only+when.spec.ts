import { ParamInfo }        from '../../src/ebdd';
import { clear, loadEBDD }  from './utils';
import { throws }           from 'assert';

describe
(
    'skip, only and when',
    () =>
    {
        let only: <ParamType>(param: ParamType) => ParamInfo<ParamType>;
        let skip: <ParamType>(param: ParamType) => ParamInfo<ParamType>;
        let when: <ParamType>(condition: boolean, param: ParamType) => ParamInfo<ParamType>;

        beforeEach
        (
            () =>
            {
                ({ only, skip } = loadEBDD());
            },
        );

        after
        (
            () =>
            {
                ({ only, skip } = clear());
            },
        );

        it('skip(skip(...))', () => throws(() => skip(skip({ }))));

        it('skip(only(...))', () => throws(() => skip(only({ }))));

        it('skip(when(true, ...))', () => throws(() => skip(when(true, { }))));

        it('skip(when(false, ...))', () => throws(() => skip(when(false, { }))));

        it('only(skip(...))', () => throws(() => only(skip({ }))));

        it('only(only(...))', () => throws(() => only(only({ }))));

        it('only(when(true, ...))', () => throws(() => only(when(true, { }))));

        it('only(when(false, ...))', () => throws(() => only(when(false, { }))));

        it('when(true, skip(...))', () => throws(() => when(true, skip({ }))));

        it('when(true, only(...))', () => throws(() => when(true, only({ }))));

        it('when(true, when(true, ...))', () => throws(() => when(true, when(true, { }))));

        it('when(true, when(false, ...))', () => throws(() => when(true, when(false, { }))));

        it('when(false, skip(...))', () => throws(() => when(false, skip({ }))));

        it('when(false, only(...))', () => throws(() => when(false, only({ }))));

        it('when(false, when(true, ...))', () => throws(() => when(false, when(true, { }))));

        it('when(false, when(false, ...))', () => throws(() => when(false, when(false, { }))));
    },
);
