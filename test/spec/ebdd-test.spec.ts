import
{
    ParamArrayLike,
    ParamInfo,
    ParameterizedTestFunction,
    UnparameterizedTestFunction,
}
from '../../src/ebdd';
import { CallCountingStub, clear, isArrayBased, loadEBDD }                      from './utils';
import { deepStrictEqual, ok, strictEqual, throws }                             from 'assert';
import
{
    AsyncFunc,
    Done,
    Func,
    MochaGlobals,
    Suite,
    Test,
    TestFunction,
    interfaces,
}
from 'mocha';
import { SinonSandbox, SinonSpy, SinonSpyCall, SinonStub, createSandbox, spy }  from 'sinon';

describe
(
    'EBDD test functions',
    () =>
    {
        interface BDDCallData
        {
            readonly it:    SinonStub;
            readonly useFn: boolean;
        }

        function assertBDDIt(ebddItAny: UnparameterizedTestFunction, bddCallData: BDDCallData): void
        {
            const { it, useFn } = bddCallData;
            const title = '123';
            {
                const fn =
                (): void =>
                { };
                const actualItReturnValue = ebddItAny(title, fn);
                ok(it.calledOnce);
                const { lastCall } = it;
                deepStrictEqual(lastCall.args, useFn ? [title, fn] : [title]);
                strictEqual(actualItReturnValue, lastCall.returnValue);
            }
            {
                const fn =
                (done: Done): void =>
                { };
                const actualItReturnValue = ebddItAny(title, fn);
                ok(it.calledTwice);
                const { lastCall } = it;
                deepStrictEqual(lastCall.args, useFn ? [title, fn] : [title]);
                strictEqual(actualItReturnValue, lastCall.returnValue);
            }
        }

        function assertBDDIts<ParamListType extends unknown[]>
        (
            ebddItAny: ParameterizedTestFunction<ParamListType, []>,
            bddCallDataList: readonly BDDCallData[],
        ):
        void
        {
            {
                const testCallback =
                (letter: string): void =>
                { };
                assertBDDItsWithParams
                (
                    ebddItAny,
                    bddCallDataList,
                    '"#" is good',
                    testCallback,
                    ([letter]: readonly unknown[]) => `"${letter}" is good`,
                    [['A'], ['B'], ['C'], ['D'], ['E']],
                    [],
                    3000,
                );
            }
            {
                const testCallback =
                (letter: string, done: Done): void =>
                { };
                const done: Done =
                () =>
                { };
                assertBDDItsWithParams
                (
                    ebddItAny,
                    bddCallDataList,
                    '"#" is good',
                    testCallback,
                    ([letter]: readonly unknown[]) => `"${letter}" is good`,
                    [['A'], ['B'], ['C'], ['D'], ['E']],
                    [done],
                    8000,
                );
            }
        }

        function assertBDDItsWithParams<ParamListType extends unknown[]>
        (
            ebddItAny:          ParameterizedTestFunction<ParamListType, []>,
            bddCallDataList:    readonly BDDCallData[],
            titlePattern:       string,
            testCallback:       (...args: any) => void,
            getExpectedTitle:   (expectedParams: readonly unknown[]) => string,
            expectedParamsList: readonly (readonly unknown[])[],
            extraArgs:          readonly unknown[],
            expectedTimeout:    number,
        ):
        void
        {
            const testCallbackSpy = spy(testCallback);
            const actualItReturnValue = ebddItAny(titlePattern, testCallbackSpy);
            const uniqueBDDItAny: CallCountingStub[] = [];
            const bddItAnyCalls = getCallsInExpectedOrder(bddCallDataList, uniqueBDDItAny);

            // it callback order
            (bddItAnyCalls as unknown as SinonSpy[]).reduce
            (
                (previousSpy: SinonSpy, currentSpy: SinonSpy) =>
                {
                    ok(currentSpy.calledImmediatelyAfter(previousSpy));
                    return currentSpy;
                },
            );

            // it callback counts
            uniqueBDDItAny.forEach
            (
                (it: CallCountingStub) =>
                {
                    strictEqual(it.callCount, it.nextCallIndex);
                },
            );

            // Test titles
            bddItAnyCalls.forEach
            (
                ({ args: [actualTitle] }: SinonSpyCall, index: number) =>
                {
                    const expectedParams = expectedParamsList[index];
                    const expectedTitle = getExpectedTitle(expectedParams);
                    strictEqual(actualTitle, expectedTitle);
                },
            );

            // Test callback functions calls
            bddItAnyCalls.forEach
            (
                ({ args: [, actualTestCallback] }: SinonSpyCall, index: number): void =>
                {
                    deepStrictEqual
                    (
                        typeof actualTestCallback,
                        bddCallDataList[index].useFn ? 'function' : 'undefined',
                    );
                    if (actualTestCallback)
                    {
                        testCallbackSpy.resetHistory();
                        const expectedThis = { };
                        (actualTestCallback as Function).call(expectedThis, ...extraArgs);
                        const { lastCall } = testCallbackSpy;
                        deepStrictEqual(lastCall.thisValue, expectedThis);
                        deepStrictEqual
                        (lastCall.args, [...expectedParamsList[index], ...extraArgs]);
                    }
                },
            );

            // Return value
            ok(isArrayBased(actualItReturnValue));
            deepStrictEqual
            (
                [...actualItReturnValue],
                bddItAnyCalls.map(({ returnValue }: SinonSpyCall<any[], Test>) => returnValue),
            );

            // Return value parent
            deepStrictEqual(actualItReturnValue.parent, expectedParent);

            // Return value timeout
            deepStrictEqual(actualItReturnValue.timeout(), expectedTimeout);
            const timeout = 42;
            actualItReturnValue.timeout(timeout);
            for (const test of actualItReturnValue)
                deepStrictEqual(test.timeout(), timeout);
        }

        function getCallsInExpectedOrder
        (bddCallDataList: readonly BDDCallData[], uniqueBDDItAny: CallCountingStub[] = []):
        SinonSpyCall[]
        {
            const bddItAnyCalls =
            bddCallDataList.map
            (
                (bddCallData: BDDCallData): SinonSpyCall =>
                {
                    const bddItAny: CallCountingStub = bddCallData.it;
                    if (uniqueBDDItAny.indexOf(bddItAny) < 0)
                        uniqueBDDItAny.push(bddItAny);
                    const nextCallIndex = bddItAny.nextCallIndex ?? 0;
                    bddItAny.nextCallIndex = nextCallIndex + 1;
                    const spyCall = bddItAny.getCall(nextCallIndex);
                    return spyCall;
                },
            );
            return bddItAnyCalls;
        }

        function getTestParams(): ParamArrayLike<string>
        {
            const params =
            [
                'A',
                ebdd.only('B'),
                ebdd.skip('C'),
                ebdd.when(true, 'D'),
                ebdd.when(false, 'E'),
            ];
            return params;
        }

        let bddIt:          BDDCallData;
        let bddItOnly:      BDDCallData;
        let bddItSkip:      BDDCallData;
        let ebdd:           MochaGlobals;
        let expectedParent: Suite;
        let sandbox:        SinonSandbox;

        beforeEach
        (
            () =>
            {
                interface BDDIt extends SinonStub
                {
                    only: SinonStub;
                }

                function newTest(title: string, fn: AsyncFunc | Func | undefined): Test
                {
                    const test = new Test(title, fn);
                    test.parent = expectedParent;
                    test.timeout(timeout += 1000);
                    return test;
                }

                sandbox = createSandbox();
                expectedParent = new Suite('Parent Suite');
                let timeout = 0;
                const it = sandbox.stub().callsFake(newTest) as BDDIt;
                bddIt = { it, useFn: true };
                bddItSkip = { it, useFn: false };
                it.only = sandbox.stub().callsFake(newTest);
                bddItOnly = { it: it.only, useFn: true };
                sandbox.stub(interfaces, 'bdd').callsFake
                (
                    (suite: Suite): void =>
                    {
                        suite.on
                        (
                            'pre-require',
                            (context: MochaGlobals): void =>
                            {
                                context.it = it as unknown as TestFunction;
                            },
                        );
                    },
                );
                ebdd = loadEBDD();
            },
        );

        afterEach(() => sandbox.restore());

        after
        (
            () =>
            {
                ({ bddIt, bddItOnly, bddItSkip, ebdd, expectedParent, sandbox } = clear());
            },
        );

        it
        (
            'it',
            () => assertBDDIt(ebdd.it, bddIt),
        );

        it
        (
            'it.only',
            () => assertBDDIt(ebdd.it.only, bddItOnly),
        );

        it
        (
            'it.only.only',
            () => throws(() => void ebdd.it.only.only, Error),
        );

        it
        (
            'it.only.skip',
            () => throws(() => void ebdd.it.only.skip, Error),
        );

        it
        (
            'it.only.when(true)',
            () => assertBDDIt(ebdd.it.only.when(true), bddItOnly),
        );

        it
        (
            'it.only.when(false)',
            () => assertBDDIt(ebdd.it.only.when(false), bddItSkip),
        );

        it
        (
            'it.only.per([...])',
            () =>
            {
                const ebddItAny = ebdd.it.only.per(getTestParams());
                const bddCallDataList = [bddItOnly, bddItOnly, bddItSkip, bddItOnly, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.skip',
            () => assertBDDIt(ebdd.it.skip, bddItSkip),
        );

        it
        (
            'it.skip.only',
            () => throws(() => void ebdd.it.skip.only, Error),
        );

        it
        (
            'it.skip.skip',
            () => throws(() => void ebdd.it.skip.skip, Error),
        );

        it
        (
            'it.skip.when(true)',
            () => assertBDDIt(ebdd.it.skip.when(true), bddItSkip),
        );

        it
        (
            'it.skip.when(false)',
            () => assertBDDIt(ebdd.it.skip.when(false), bddItSkip),
        );

        it
        (
            'it.skip.per([...])',
            () =>
            {
                const ebddItAny = ebdd.it.skip.per(getTestParams());
                const bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.when(true)',
            () => assertBDDIt(ebdd.it.when(true), bddIt),
        );

        it
        (
            'it.when(true).only',
            () => assertBDDIt(ebdd.it.when(true).only, bddItOnly),
        );

        it
        (
            'it.when(true).skip',
            () => assertBDDIt(ebdd.it.when(true).skip, bddItSkip),
        );

        it
        (
            'it.when(true).when(true)',
            () => assertBDDIt(ebdd.it.when(true).when(true), bddIt),
        );

        it
        (
            'it.when(true).when(false)',
            () => assertBDDIt(ebdd.it.when(true).when(false), bddItSkip),
        );

        it
        (
            'it.when(true).per([...])',
            () =>
            {
                const ebddItAny = ebdd.it.when(true).per(getTestParams());
                const bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.when(false)',
            () => assertBDDIt(ebdd.it.when(false), bddItSkip),
        );

        it
        (
            'it.when(false).only',
            () => assertBDDIt(ebdd.it.when(false).only, bddItSkip),
        );

        it
        (
            'it.when(false).skip',
            () => assertBDDIt(ebdd.it.when(false).skip, bddItSkip),
        );

        it
        (
            'it.when(false).when(true)',
            () => assertBDDIt(ebdd.it.when(false).when(true), bddItSkip),
        );

        it
        (
            'it.when(false).when(false)',
            () => assertBDDIt(ebdd.it.when(false).when(false), bddItSkip),
        );

        it
        (
            'it.when(false).per([...])',
            () =>
            {
                const ebddItAny = ebdd.it.when(false).per(getTestParams());
                const bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.per([...]).only',
            () =>
            {
                const ebddItAny = ebdd.it.per(getTestParams()).only;
                const bddCallDataList = [bddItOnly, bddItOnly, bddItSkip, bddItOnly, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.per([...]).skip',
            () =>
            {
                const ebddItAny = ebdd.it.per(getTestParams()).skip;
                const bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.per([...]).when(true)',
            () =>
            {
                const ebddItAny = ebdd.it.per(getTestParams()).when(true);
                const bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.per([...]).when(false)',
            () =>
            {
                const ebddItAny = ebdd.it.per(getTestParams()).when(false);
                const bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.per([...]).per([...])',
            () =>
            {
                const ebddItAny =
                ebdd.it
                .per({ 0: 3, 1: ebdd.only(7), 2: ebdd.skip(11), length: 3 })
                .per(['potatoes', ebdd.only('tomatoes'), ebdd.skip('pizzas')]);

                const bddCallDataList =
                [
                    bddIt,
                    bddItOnly,
                    bddItSkip,
                    bddItOnly,
                    bddItOnly,
                    bddItSkip,
                    bddItSkip,
                    bddItSkip,
                    bddItSkip,
                ];

                const expectedParamsList =
                [
                    [3, 'potatoes'],
                    [3, 'tomatoes'],
                    [3, 'pizzas'],
                    [7, 'potatoes'],
                    [7, 'tomatoes'],
                    [7, 'pizzas'],
                    [11, 'potatoes'],
                    [11, 'tomatoes'],
                    [11, 'pizzas'],
                ];

                const testCallback =
                (count: number, food: string): void =>
                { };

                assertBDDItsWithParams
                (
                    ebddItAny,
                    bddCallDataList,
                    '#1 #2',
                    testCallback,
                    ([count, food]: readonly unknown[]) => `${count} ${food}`,
                    expectedParamsList,
                    [],
                    5000,
                );
            },
        );

        it
        (
            'it.adapt(...)',
            () =>
            {
                const testCallback =
                (): void =>
                { };
                const adaptParams = [42, 'foo', { }];
                const adapter = spy();
                const adaptedIt = ebdd.it.adapt(adapter);
                adaptedIt('some title', testCallback, ...adaptParams);

                ok(!('adapt' in adaptedIt));
                ok('only' in adaptedIt);
                ok('per' in adaptedIt);
                ok('skip' in adaptedIt);
                ok('when' in adaptedIt);
                ok(adapter.calledOnce);
                const { lastCall } = adapter;
                deepStrictEqual(lastCall.thisValue, bddIt.it.lastCall.returnValue);
                deepStrictEqual(lastCall.args, adaptParams);
            },
        );

        it
        (
            'it.adapt(...).per([...])',
            () =>
            {
                const testCallback =
                (letter: string): void =>
                { };
                const adaptParams = [42, 'foo', { }];
                const adapter = spy();
                const adaptedIt = ebdd.it.adapt(adapter);
                adaptedIt.per(getTestParams())('some title', testCallback, ...adaptParams);
                const bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];
                const bddItAnyCalls = getCallsInExpectedOrder(bddCallDataList);

                bddItAnyCalls.forEach
                (
                    (bddItAnyCall: SinonSpyCall, index: number): void =>
                    {
                        const adapterCall = adapter.getCall(index);
                        deepStrictEqual(adapterCall.thisValue, bddItAnyCall.returnValue);
                    },
                );
                ok(adapter.alwaysCalledWithExactly(...adaptParams));
            },
        );

        it
        (
            'it.adapt with undefined adapter function',
            // @ts-expect-error
            () => throws(() => ebdd.it.adapt(undefined), TypeError),
        );

        it
        (
            'it.adapt with invalid adapter function',
            // @ts-expect-error
            () => throws(() => ebdd.it.adapt({ }), TypeError),
        );

        it
        (
            'specify',
            () => strictEqual(ebdd.specify, ebdd.it),
        );

        it
        (
            'xit',
            () => assertBDDIt(ebdd.xit, bddItSkip),
        );

        it
        (
            'xit.only',
            () => throws(() => void ebdd.xit.only, Error),
        );

        it
        (
            'xit.skip',
            () => throws(() => void ebdd.xit.skip, Error),
        );

        it
        (
            'xit.when(true)',
            () => assertBDDIt(ebdd.xit.when(true), bddItSkip),
        );

        it
        (
            'xit.when(false)',
            () => assertBDDIt(ebdd.xit.when(false), bddItSkip),
        );

        it
        (
            'xit.per([...])',
            () =>
            {
                const ebddItAny = ebdd.xit.per(getTestParams());
                const bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'xspecify',
            () => strictEqual(ebdd.xspecify, ebdd.xit),
        );

        it
        (
            'unparameterized it with undefined title',
            () =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws(() => ebdd.it(undefined, fn), TypeError);
            },
        );

        it
        (
            'unparameterized it with invalid title',
            () =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws(() => ebdd.it({ }, fn), TypeError);
            },
        );

        it
        (
            'unparameterized it with undefined callback function',
            () => throws(() => ebdd.it('test', undefined), TypeError),
        );

        it
        (
            'unparameterized it with invalid callback function',
            // @ts-expect-error
            () => throws(() => ebdd.it('test', { }), TypeError),
        );

        it
        (
            'unparameterized it with callback function accepting wrong number of arguments',
            () =>
            {
                const fn =
                (arg0: never, arg1: never): void =>
                { };
                // @ts-expect-error
                throws(() => ebdd.it('test', fn), RangeError);
            },
        );

        it
        (
            'parameterized it with undefined title',
            () =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws(() => ebdd.it.per([0])(undefined, fn), TypeError);
            },
        );

        it
        (
            'parameterized it with invalid title',
            () =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws(() => ebdd.it.per([0])({ }, fn), TypeError);
            },
        );

        it
        (
            'parameterized it with undefined callback function',
            // @ts-expect-error
            () => throws(() => ebdd.it.per([0])('test', undefined), TypeError),
        );

        it
        (
            'parameterized it with invalid callback function',
            // @ts-expect-error
            () => throws(() => ebdd.it.per([0])('test', { }), TypeError),
        );

        it
        (
            'parameterized it with callback function accepting wrong number of arguments',
            () =>
            {
                const fn =
                (): void =>
                { };
                throws(() => ebdd.it.per([0])('test', fn), RangeError);
            },
        );

        it
        (
            'per with undefined argument',
            // @ts-expect-error
            () => throws(() => ebdd.it.per(undefined), TypeError),
        );

        it
        (
            'per with null argument',
            // @ts-expect-error
            () => throws(() => ebdd.it.per(null), TypeError),
        );

        it
        (
            'per with empty array-like',
            () => throws(() => ebdd.it.per(''), TypeError),
        );

        it
        (
            'per with invalid parameter',
            () =>
            {
                // @ts-expect-error
                const paramInfo = new ParamInfo(42, 'foo');
                throws(() => ebdd.it.per([paramInfo]), TypeError);
            },
        );
    },
);
