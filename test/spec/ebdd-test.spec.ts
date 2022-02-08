import type
{ ParamInfo, ParamOrParamInfo, ParameterizedTestFunction, UnparameterizedTestFunction }
from '../../src/ebdd';
import { clear, isArrayBased, loadEBDD }                            from './utils';
import type { CallCountingStub }                                    from './utils';
import { deepStrictEqual, ok, strictEqual, throws }                 from 'assert';
import { Suite, Test, interfaces }                                  from 'mocha';
import type { AsyncFunc, Done, Func, MochaGlobals, TestFunction }   from 'mocha';
import { createSandbox, spy }                                       from 'sinon';
import type { SinonSandbox, SinonSpy, SinonSpyCall, SinonStub }     from 'sinon';

describe
(
    'EBDD test functions',
    (): void =>
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
                (done: Done): void => // eslint-disable-line @typescript-eslint/no-unused-vars
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
            ebddItAny: ParameterizedTestFunction<ParamListType>,
            bddCallDataList: readonly BDDCallData[],
            expectedParamsList: readonly (readonly unknown[])[] =
            [['A'], ['B'], ['C'], ['D'], ['E']],
        ):
        void
        {
            {
                const testCallback =
                (letter: string): void => // eslint-disable-line @typescript-eslint/no-unused-vars
                { };

                assertBDDItsWithParams
                (
                    ebddItAny,
                    bddCallDataList,
                    '"#" is good',
                    testCallback,
                    ([letter]: readonly unknown[]): string => `"${letter}" is good`,
                    expectedParamsList,
                    [],
                    3000,
                );
            }
            {
                const testCallback =
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                (letter: string, done: Done): void =>
                { };

                const done: Done =
                (): void =>
                { };

                assertBDDItsWithParams
                (
                    ebddItAny,
                    bddCallDataList,
                    '"#" is good',
                    testCallback,
                    ([letter]: readonly unknown[]): string => `"${letter}" is good`,
                    expectedParamsList,
                    [done],
                    8000,
                );
            }
        }

        function assertBDDItsWithParams<ParamListType extends unknown[]>
        (
            ebddItAny:          ParameterizedTestFunction<ParamListType>,
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
                (previousSpy: SinonSpy, currentSpy: SinonSpy): SinonSpy =>
                {
                    ok(currentSpy.calledImmediatelyAfter(previousSpy));
                    return currentSpy;
                },
            );

            // it callback counts
            uniqueBDDItAny.forEach
            (
                (it: CallCountingStub): void =>
                {
                    strictEqual(it.callCount, it.nextCallIndex);
                },
            );

            // Test titles
            bddItAnyCalls.forEach
            (
                ({ args: [actualTitle] }: SinonSpyCall, index: number): void =>
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
            strictEqual(actualItReturnValue.length, bddCallDataList.length);
            bddItAnyCalls.forEach
            (
                ({ returnValue: expectedReturnValue }: SinonSpyCall, index: number): void =>
                {
                    const actualReturnValue = actualItReturnValue[index];
                    strictEqual(actualReturnValue, expectedReturnValue);
                },
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

        function getTestParams(): ParamOrParamInfo<string>[]
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
            (): void =>
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

        afterEach((): void => sandbox.restore());

        after
        (
            (): void =>
            {
                ({ bddIt, bddItOnly, bddItSkip, ebdd, expectedParent, sandbox } = clear());
            },
        );

        it
        (
            'it',
            (): void => assertBDDIt(ebdd.it, bddIt),
        );

        it
        (
            'it.only',
            (): void => assertBDDIt(ebdd.it.only, bddItOnly),
        );

        it
        (
            'it.only.only',
            (): void => throws((): unknown => void ebdd.it.only.only, Error),
        );

        it
        (
            'it.only.skip',
            (): void => throws((): unknown => void ebdd.it.only.skip, Error),
        );

        it
        (
            'it.only.when(true)',
            (): void => assertBDDIt(ebdd.it.only.when(true), bddItOnly),
        );

        it
        (
            'it.only.when(false)',
            (): void => assertBDDIt(ebdd.it.only.when(false), bddItSkip),
        );

        it
        (
            'it.only.per([...])',
            (): void =>
            {
                const ebddItAny = ebdd.it.only.per(getTestParams());
                const bddCallDataList = [bddItOnly, bddItOnly, bddItSkip, bddItOnly, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.skip',
            (): void => assertBDDIt(ebdd.it.skip, bddItSkip),
        );

        it
        (
            'it.skip.only',
            (): void => throws((): unknown => void ebdd.it.skip.only, Error),
        );

        it
        (
            'it.skip.skip',
            (): void => throws((): unknown => void ebdd.it.skip.skip, Error),
        );

        it
        (
            'it.skip.when(true)',
            (): void => assertBDDIt(ebdd.it.skip.when(true), bddItSkip),
        );

        it
        (
            'it.skip.when(false)',
            (): void => assertBDDIt(ebdd.it.skip.when(false), bddItSkip),
        );

        it
        (
            'it.skip.per([...])',
            (): void =>
            {
                const ebddItAny = ebdd.it.skip.per(getTestParams());
                const bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.when(true)',
            (): void => assertBDDIt(ebdd.it.when(true), bddIt),
        );

        it
        (
            'it.when(true).only',
            (): void => assertBDDIt(ebdd.it.when(true).only, bddItOnly),
        );

        it
        (
            'it.when(true).skip',
            (): void => assertBDDIt(ebdd.it.when(true).skip, bddItSkip),
        );

        it
        (
            'it.when(true).when(true)',
            (): void => assertBDDIt(ebdd.it.when(true).when(true), bddIt),
        );

        it
        (
            'it.when(true).when(false)',
            (): void => assertBDDIt(ebdd.it.when(true).when(false), bddItSkip),
        );

        it
        (
            'it.when(true).per([...])',
            (): void =>
            {
                const ebddItAny = ebdd.it.when(true).per(getTestParams());
                const bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.when(false)',
            (): void => assertBDDIt(ebdd.it.when(false), bddItSkip),
        );

        it
        (
            'it.when(false).only',
            (): void => assertBDDIt(ebdd.it.when(false).only, bddItSkip),
        );

        it
        (
            'it.when(false).skip',
            (): void => assertBDDIt(ebdd.it.when(false).skip, bddItSkip),
        );

        it
        (
            'it.when(false).when(true)',
            (): void => assertBDDIt(ebdd.it.when(false).when(true), bddItSkip),
        );

        it
        (
            'it.when(false).when(false)',
            (): void => assertBDDIt(ebdd.it.when(false).when(false), bddItSkip),
        );

        it
        (
            'it.when(false).per([...])',
            (): void =>
            {
                const ebddItAny = ebdd.it.when(false).per(getTestParams());
                const bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.per([...])',
            (): void =>
            {
                const ebddItAny = ebdd.it.per(getTestParams());
                const bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList, [['A'], ['B'], ['C'], ['D'], ['E']]);
            },
        );

        it
        (
            'it.per([...], ...)',
            (): void =>
            {
                const ebddItAny =
                ebdd.it.per(getTestParams(), (letter: string): string => `${letter}${letter}`);
                const bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList, [['AA'], ['BB'], ['CC'], ['DD'], ['EE']]);
            },
        );

        it
        (
            'it.per([...], only)',
            (): void =>
            {
                const ebddItAny =
                ebdd.it.per
                (
                    getTestParams(),
                    (letter: string): ParamInfo<number> => ebdd.only(letter.charCodeAt(0)),
                );
                const bddCallDataList = [bddItOnly, bddItOnly, bddItSkip, bddItOnly, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList, [[65], [66], [67], [68], [69]]);
            },
        );

        it
        (
            'it.per([...], skip)',
            (): void =>
            {
                const ebddItAny =
                ebdd.it.per
                (
                    getTestParams(),
                    (letter: string): ParamOrParamInfo<string> =>
                    letter.charCodeAt(0) & 0b1 ? `${letter}${letter}` : ebdd.skip(letter),
                );
                const bddCallDataList = [bddIt, bddItSkip, bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList, [['AA'], ['B'], ['CC'], ['D'], ['EE']]);
            },
        );

        it
        (
            'it.per([...]).only',
            (): void =>
            {
                const ebddItAny = ebdd.it.per(getTestParams()).only;
                const bddCallDataList = [bddItOnly, bddItOnly, bddItSkip, bddItOnly, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.per([...]).skip',
            (): void =>
            {
                const ebddItAny = ebdd.it.per(getTestParams()).skip;
                const bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.per([...]).when(true)',
            (): void =>
            {
                const ebddItAny = ebdd.it.per(getTestParams()).when(true);
                const bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.per([...]).when(false)',
            (): void =>
            {
                const ebddItAny = ebdd.it.per(getTestParams()).when(false);
                const bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'it.per([...]).per([...])',
            (): void =>
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                (count: number, food: string): void =>
                { };

                assertBDDItsWithParams
                (
                    ebddItAny,
                    bddCallDataList,
                    '#1 #2',
                    testCallback,
                    ([count, food]: readonly unknown[]): string => `${count} ${food}`,
                    expectedParamsList,
                    [],
                    5000,
                );
            },
        );

        it
        (
            'specify',
            (): void => strictEqual(ebdd.specify, ebdd.it),
        );

        it
        (
            'xit',
            (): void => assertBDDIt(ebdd.xit, bddItSkip),
        );

        it
        (
            'xit.only',
            (): void => throws((): unknown => void ebdd.xit.only, Error),
        );

        it
        (
            'xit.skip',
            (): void => throws((): unknown => void ebdd.xit.skip, Error),
        );

        it
        (
            'xit.when(true)',
            (): void => assertBDDIt(ebdd.xit.when(true), bddItSkip),
        );

        it
        (
            'xit.when(false)',
            (): void => assertBDDIt(ebdd.xit.when(false), bddItSkip),
        );

        it
        (
            'xit.per([...])',
            (): void =>
            {
                const ebddItAny = ebdd.xit.per(getTestParams());
                const bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddCallDataList);
            },
        );

        it
        (
            'xspecify',
            (): void => strictEqual(ebdd.xspecify, ebdd.xit),
        );

        it
        (
            'unparameterized it with undefined title',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws((): unknown => ebdd.it(undefined, fn), TypeError);
            },
        );

        it
        (
            'unparameterized it with invalid title',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws((): unknown => ebdd.it({ }, fn), TypeError);
            },
        );

        it
        (
            'unparameterized it with undefined callback function',
            (): void => throws((): unknown => ebdd.it('test', undefined), TypeError),
        );

        it
        (
            'unparameterized it with invalid callback function',
            // @ts-expect-error
            (): void => throws((): unknown => ebdd.it('test', { }), TypeError),
        );

        it
        (
            'unparameterized it with callback function accepting wrong number of arguments',
            (): void =>
            {
                const fn =
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                (arg0: never, arg1: never): void =>
                { };
                throws
                (
                    // @ts-expect-error
                    (): unknown => ebdd.it('test', fn),
                    (error: unknown): boolean =>
                    error instanceof RangeError && /\b0 parameters\b/.test(error.message),
                );
            },
        );

        it
        (
            'parameterized it with undefined title',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws((): unknown => ebdd.it.per([0])(undefined, fn), TypeError);
            },
        );

        it
        (
            'parameterized it with invalid title',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws((): unknown => ebdd.it.per([0])({ }, fn), TypeError);
            },
        );

        it
        (
            'parameterized it with undefined callback function',
            // @ts-expect-error
            (): void => throws((): unknown => ebdd.it.per([0])('test', undefined), TypeError),
        );

        it
        (
            'parameterized it with invalid callback function',
            // @ts-expect-error
            (): void => throws((): unknown => ebdd.it.per([0])('test', { }), TypeError),
        );

        it
        (
            'simply parameterized it with callback function accepting wrong number of arguments',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                throws
                (
                    (): unknown => ebdd.it.per([0])('test', fn),
                    (error: unknown): boolean =>
                    error instanceof RangeError && /\b1 parameter\b/.test(error.message),
                );
            },
        );

        it
        (
            'multiparameterized it with callback function accepting wrong number of arguments',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                throws
                (
                    (): unknown => ebdd.it.per([0]).per([1])('test', fn),
                    (error: unknown): boolean =>
                    error instanceof RangeError && /\b2 parameters\b/.test(error.message),
                );
            },
        );

        it
        (
            'per with undefined params argument',
            // @ts-expect-error
            (): void => throws((): unknown => ebdd.it.per(undefined), TypeError),
        );

        it
        (
            'per with null params argument',
            // @ts-expect-error
            (): void => throws((): unknown => ebdd.it.per(null), TypeError),
        );

        it
        (
            'per with empty array-like params argument',
            (): void => throws((): unknown => ebdd.it.per(''), TypeError),
        );

        it
        (
            'per with invalid parameter',
            (): void =>
            {
                const paramInfo = ebdd.when(true, 42);
                // @ts-expect-error
                paramInfo.mode = 'foo';
                throws((): unknown => ebdd.it.per([paramInfo]), TypeError);
            },
        );

        it
        (
            'per with invalid paramMapper argument',
            (): void =>
            {
                // @ts-expect-error
                throws((): void => ebdd.it.per([1], 'WRONG'), TypeError);
            },
        );
    },
);
