import type
{ ParamInfo, ParamOrParamInfo, ParameterizedSuiteFunction, UnparameterizedSuiteFunction }
from '../../src/ebdd';

import { type CallCountingStub, EMPTY_OBJ, isArrayBased, loadEBDD }                 from './utils';
import { deepStrictEqual, ok, strictEqual, throws }                                 from 'assert';
import { type Context, type MochaGlobals, Suite, type SuiteFunction, interfaces }   from 'mocha';

import { type SinonSandbox, type SinonSpy, type SinonSpyCall, type SinonStub, createSandbox, spy }
from 'sinon';

describe
(
    'EBDD suite functions',
    (): void =>
    {
        function assertBDDDescribe
        (ebddDescribeAny: UnparameterizedSuiteFunction, bddDescribeAny: SinonStub): void
        {
            const title = '123';
            const fn =
            (): void =>
            { };
            const actual = ebddDescribeAny(title, fn);
            ok(bddDescribeAny.calledOnce);
            const { firstCall } = bddDescribeAny;
            deepStrictEqual(firstCall.args, [title, fn]);
            strictEqual(actual, firstCall.returnValue);
        }

        function assertBDDDescribes<ParamListType extends unknown[]>
        (
            ebddDescribeAny:    ParameterizedSuiteFunction<ParamListType>,
            bddDescribeAnyList: readonly SinonStub[],
            expectedParamsList: readonly (readonly unknown[])[] =
            [['A'], ['B'], ['C'], ['D'], ['E']],
        ):
        void
        {
            const suiteCallback =
            (letter: string): void => // eslint-disable-line @typescript-eslint/no-unused-vars
            { };

            assertBDDDescribesWithParams
            (
                ebddDescribeAny,
                bddDescribeAnyList,
                '"#" is good',
                suiteCallback,
                ([letter]: readonly unknown[]): string => `"${letter}" is good`,
                expectedParamsList,
            );
        }

        function assertBDDDescribesWithParams<ParamListType extends unknown[]>
        (
            ebddDescribeAny:    ParameterizedSuiteFunction<ParamListType>,
            bddDescribeAnyList: readonly SinonStub[],
            titlePattern:       string,
            suiteCallback:      (...args: any) => void,
            getExpectedTitle:   (expectedParams: readonly unknown[]) => string,
            expectedParamsList: readonly (readonly unknown[])[],
        ):
        void
        {
            const suiteCallbackSpy = spy(suiteCallback);
            const actualDescribeReturnValue = ebddDescribeAny(titlePattern, suiteCallbackSpy);
            const uniqueBDDDescribeAny: CallCountingStub[] = [];
            const bddDescribeAnyCalls =
            getCallsInExpectedOrder(bddDescribeAnyList, uniqueBDDDescribeAny);

            // describe callback order
            (bddDescribeAnyCalls as unknown as SinonSpy[]).reduce
            (
                (previousSpy: SinonSpy, currentSpy: SinonSpy): SinonSpy =>
                {
                    ok(currentSpy.calledImmediatelyAfter(previousSpy));
                    return currentSpy;
                },
            );

            // describe callback counts
            uniqueBDDDescribeAny.forEach
            (
                (bddDescribeAny: CallCountingStub): void =>
                {
                    strictEqual(bddDescribeAny.callCount, bddDescribeAny.nextCallIndex);
                },
            );

            // Suite titles
            bddDescribeAnyCalls.forEach
            (
                ({ args: [actualTitle] }: SinonSpyCall, index: number): void =>
                {
                    const expectedParams = expectedParamsList[index];
                    const expectedTitle = getExpectedTitle(expectedParams);
                    strictEqual(actualTitle, expectedTitle);
                },
            );

            // Suite callback functions calls
            bddDescribeAnyCalls.forEach
            (
                ({ args: [, actualSuiteCallback] }: SinonSpyCall, index: number): void =>
                {
                    suiteCallbackSpy.resetHistory();
                    const expectedThis = { };
                    (actualSuiteCallback as Function).call(expectedThis);
                    const { lastCall } = suiteCallbackSpy;
                    deepStrictEqual(lastCall.thisValue, expectedThis);
                    deepStrictEqual(lastCall.args, expectedParamsList[index]);
                },
            );

            // Return value
            ok(isArrayBased(actualDescribeReturnValue));
            strictEqual(actualDescribeReturnValue.length, bddDescribeAnyCalls.length);
            bddDescribeAnyCalls.forEach
            (
                ({ returnValue: expectedReturnValue }: SinonSpyCall, index: number): void =>
                {
                    const actualReturnValue = actualDescribeReturnValue[index];
                    strictEqual(actualReturnValue, expectedReturnValue);
                },
            );

            // Return value parent
            deepStrictEqual(actualDescribeReturnValue.parent, expectedParent);

            // Return value timeout
            const suiteCount = bddDescribeAnyList.length;
            const expectedTimeout = (suiteCount + 1) * 500;
            deepStrictEqual(actualDescribeReturnValue.timeout(), expectedTimeout);
            const timeout = 42;
            actualDescribeReturnValue.timeout(timeout);
            for (const suite of actualDescribeReturnValue)
                deepStrictEqual(suite.timeout(), timeout);
        }

        function getCallsInExpectedOrder
        (bddDescribeAnyList: readonly SinonStub[], uniqueBDDDescribeAny: CallCountingStub[] = []):
        SinonSpyCall[]
        {
            const bddDescribeAnyCalls =
            bddDescribeAnyList.map
            (
                (bddDescribeAny: CallCountingStub): SinonSpyCall =>
                {
                    if (uniqueBDDDescribeAny.indexOf(bddDescribeAny) < 0)
                        uniqueBDDDescribeAny.push(bddDescribeAny);
                    const nextCallIndex = bddDescribeAny.nextCallIndex ?? 0;
                    bddDescribeAny.nextCallIndex = nextCallIndex + 1;
                    const spyCall = bddDescribeAny.getCall(nextCallIndex);
                    return spyCall;
                },
            );
            return bddDescribeAnyCalls;
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

        let bddDescribe:        SinonStub;
        let bddDescribeOnly:    SinonStub;
        let bddDescribeSkip:    SinonStub;
        let ebdd:               MochaGlobals;
        let expectedParent:     Suite;
        let sandbox:            SinonSandbox;

        beforeEach
        (
            (): void =>
            {
                interface BDDDescribe extends SinonStub
                {
                    only: SinonStub;
                    skip: SinonStub;
                }

                function newSuite(title: string, parentContext?: Context): Suite
                {
                    const suite = new Suite(title, parentContext);
                    suite.parent = expectedParent;
                    suite.timeout(timeout += 1000);
                    return suite;
                }

                sandbox = createSandbox();
                expectedParent = new Suite('Parent Suite');
                let timeout = 0;
                const describe = bddDescribe = sandbox.stub().callsFake(newSuite) as BDDDescribe;
                bddDescribeOnly = describe.only = sandbox.stub().callsFake(newSuite);
                bddDescribeSkip = describe.skip = sandbox.stub().callsFake(newSuite);
                sandbox.stub(interfaces, 'bdd').callsFake
                (
                    (suite: Suite): void =>
                    {
                        suite.on
                        (
                            'pre-require',
                            (context: MochaGlobals): void =>
                            {
                                context.describe = describe as unknown as SuiteFunction;
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
                ({ bddDescribe, bddDescribeOnly, bddDescribeSkip, ebdd } = EMPTY_OBJ);
            },
        );

        it
        (
            'describe',
            (): void => assertBDDDescribe(ebdd.describe, bddDescribe),
        );

        it
        (
            'describe.only',
            (): void => assertBDDDescribe(ebdd.describe.only, bddDescribeOnly),
        );

        it
        (
            'describe.only.only',
            (): void => throws((): void => void ebdd.describe.only.only, Error),
        );

        it
        (
            'describe.only.skip',
            (): void => throws((): void => void ebdd.describe.only.skip, Error),
        );

        it
        (
            'describe.only.when(true)',
            (): void => assertBDDDescribe(ebdd.describe.only.when(true), bddDescribeOnly),
        );

        it
        (
            'describe.only.when(false)',
            (): void => assertBDDDescribe(ebdd.describe.only.when(false), bddDescribeSkip),
        );

        it
        (
            'describe.only.per([...])',
            (): void =>
            {
                const ebddDescribeAny = ebdd.describe.only.per(getTestParams());
                const bddDescribeAnyList =
                [
                    bddDescribeOnly,
                    bddDescribeOnly,
                    bddDescribeSkip,
                    bddDescribeOnly,
                    bddDescribeSkip,
                ];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
            },
        );

        it
        (
            'describe.skip',
            (): void => assertBDDDescribe(ebdd.describe.skip, bddDescribeSkip),
        );

        it
        (
            'describe.skip.only',
            (): void => throws((): void => void ebdd.describe.skip.only, Error),
        );

        it
        (
            'describe.skip.skip',
            (): void => throws((): void => void ebdd.describe.skip.skip, Error),
        );

        it
        (
            'describe.skip.when(true)',
            (): void => assertBDDDescribe(ebdd.describe.skip.when(true), bddDescribeSkip),
        );

        it
        (
            'describe.skip.when(false)',
            (): void => assertBDDDescribe(ebdd.describe.skip.when(false), bddDescribeSkip),
        );

        it
        (
            'describe.skip.per([...])',
            (): void =>
            {
                const ebddDescribeAny = ebdd.describe.skip.per(getTestParams());
                const bddDescribeAnyList =
                [
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                ];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
            },
        );

        it
        (
            'describe.when(true)',
            (): void => assertBDDDescribe(ebdd.describe.when(true), bddDescribe),
        );

        it
        (
            'describe.when(true).only',
            (): void => assertBDDDescribe(ebdd.describe.when(true).only, bddDescribeOnly),
        );

        it
        (
            'describe.when(true).skip',
            (): void => assertBDDDescribe(ebdd.describe.when(true).skip, bddDescribeSkip),
        );

        it
        (
            'describe.when(true).when(true)',
            (): void => assertBDDDescribe(ebdd.describe.when(true).when(true), bddDescribe),
        );

        it
        (
            'describe.when(true).when(false)',
            (): void => assertBDDDescribe(ebdd.describe.when(true).when(false), bddDescribeSkip),
        );

        it
        (
            'describe.when(true).per([...])',
            (): void =>
            {
                const ebddDescribeAny = ebdd.describe.when(true).per(getTestParams());
                const bddDescribeAnyList =
                [bddDescribe, bddDescribeOnly, bddDescribeSkip, bddDescribe, bddDescribeSkip];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
            },
        );

        it
        (
            'describe.when(false)',
            (): void => assertBDDDescribe(ebdd.describe.when(false), bddDescribeSkip),
        );

        it
        (
            'describe.when(false).only',
            (): void => assertBDDDescribe(ebdd.describe.when(false).only, bddDescribeSkip),
        );

        it
        (
            'describe.when(false).skip',
            (): void => assertBDDDescribe(ebdd.describe.when(false).skip, bddDescribeSkip),
        );

        it
        (
            'describe.when(false).when(true)',
            (): void => assertBDDDescribe(ebdd.describe.when(false).when(true), bddDescribeSkip),
        );

        it
        (
            'describe.when(false).when(false)',
            (): void => assertBDDDescribe(ebdd.describe.when(false).when(false), bddDescribeSkip),
        );

        it
        (
            'describe.when(false).per([...])',
            (): void =>
            {
                const ebddDescribeAny = ebdd.describe.when(false).per(getTestParams());
                const bddDescribeAnyList =
                [
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                ];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
            },
        );

        it
        (
            'describe.per([...])',
            (): void =>
            {
                const ebddDescribeAny = ebdd.describe.per(getTestParams());
                const bddDescribeAnyList =
                [
                    bddDescribe,
                    bddDescribeOnly,
                    bddDescribeSkip,
                    bddDescribe,
                    bddDescribeSkip,
                ];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
            },
        );

        it
        (
            'describe.per([...], ...)',
            (): void =>
            {
                const ebddDescribeAny =
                ebdd.describe.per
                (getTestParams(), (letter: string): string => letter.toLowerCase());
                const bddDescribeAnyList =
                [
                    bddDescribe,
                    bddDescribeOnly,
                    bddDescribeSkip,
                    bddDescribe,
                    bddDescribeSkip,
                ];

                assertBDDDescribes
                (ebddDescribeAny, bddDescribeAnyList, [['a'], ['b'], ['c'], ['d'], ['e']]);
            },
        );

        it
        (
            'describe.per([...], only)',
            (): void =>
            {
                const ebddDescribeAny =
                ebdd.describe.per
                (
                    getTestParams(),
                    (letter: string): ParamInfo<string> => ebdd.only(letter.toLowerCase()),
                );
                const bddDescribeAnyList =
                [
                    bddDescribeOnly,
                    bddDescribeOnly,
                    bddDescribeSkip,
                    bddDescribeOnly,
                    bddDescribeSkip,
                ];

                assertBDDDescribes
                (ebddDescribeAny, bddDescribeAnyList, [['a'], ['b'], ['c'], ['d'], ['e']]);
            },
        );

        it
        (
            'describe.per([...], skip)',
            (): void =>
            {
                const ebddDescribeAny =
                ebdd.describe.per
                (
                    getTestParams(),
                    (letter: string): ParamOrParamInfo<string> =>
                    letter.charCodeAt(0) & 0b1 ? letter.toLowerCase() : ebdd.skip(letter),
                );
                const bddDescribeAnyList =
                [
                    bddDescribe,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                ];

                assertBDDDescribes
                (ebddDescribeAny, bddDescribeAnyList, [['a'], ['B'], ['c'], ['D'], ['e']]);
            },
        );

        it
        (
            'describe.per([...]).only',
            (): void =>
            {
                const ebddDescribeAny = ebdd.describe.per(getTestParams()).only;
                const bddDescribeAnyList =
                [
                    bddDescribeOnly,
                    bddDescribeOnly,
                    bddDescribeSkip,
                    bddDescribeOnly,
                    bddDescribeSkip,
                ];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
            },
        );

        it
        (
            'describe.per([...]).skip',
            (): void =>
            {
                const ebddDescribeAny = ebdd.describe.per(getTestParams()).skip;
                const bddDescribeAnyList =
                [
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                ];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
            },
        );

        it
        (
            'describe.per([...]).when(true)',
            (): void =>
            {
                const ebddDescribeAny = ebdd.describe.per(getTestParams()).when(true);
                const bddDescribeAnyList =
                [bddDescribe, bddDescribeOnly, bddDescribeSkip, bddDescribe, bddDescribeSkip];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
            },
        );

        it
        (
            'describe.per([...]).when(false)',
            (): void =>
            {
                const ebddDescribeAny = ebdd.describe.per(getTestParams()).when(false);
                const bddDescribeAnyList =
                [
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                ];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
            },
        );

        it
        (
            'describe.per([...]).per([...])',
            (): void =>
            {
                const ebddDescribeAny =
                ebdd.describe
                .per({ 0: 3, 1: ebdd.only(7), 2: ebdd.skip(11), length: 3 })
                .per(['potatoes', ebdd.only('tomatoes'), ebdd.skip('pizzas')]);

                const bddDescribeAnyList =
                [
                    bddDescribe,
                    bddDescribeOnly,
                    bddDescribeSkip,
                    bddDescribeOnly,
                    bddDescribeOnly,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
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

                const suiteCallback =
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                (count: number, food: string): void =>
                { };

                assertBDDDescribesWithParams
                (
                    ebddDescribeAny,
                    bddDescribeAnyList,
                    '#1 #2',
                    suiteCallback,
                    ([count, food]: readonly unknown[]): string => `${count} ${food}`,
                    expectedParamsList,
                );
            },
        );

        it
        (
            'context',
            (): void => strictEqual(ebdd.context, ebdd.describe),
        );

        it
        (
            'xdescribe',
            (): void => assertBDDDescribe(ebdd.xdescribe, bddDescribeSkip),
        );

        it
        (
            'xdescribe.only',
            (): void => throws((): void => void ebdd.xdescribe.only, Error),
        );

        it
        (
            'xdescribe.skip',
            (): void => throws((): void => void ebdd.xdescribe.skip, Error),
        );

        it
        (
            'xdescribe.when(true)',
            (): void => assertBDDDescribe(ebdd.xdescribe.when(true), bddDescribeSkip),
        );

        it
        (
            'xdescribe.when(false)',
            (): void => assertBDDDescribe(ebdd.xdescribe.when(false), bddDescribeSkip),
        );

        it
        (
            'xdescribe.per([...])',
            (): void =>
            {
                const ebddDescribeAny = ebdd.xdescribe.per(getTestParams());
                const bddDescribeAnyList =
                [
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                    bddDescribeSkip,
                ];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
            },
        );

        it
        (
            'xcontext',
            (): void => strictEqual(ebdd.xcontext, ebdd.xdescribe),
        );

        it
        (
            'unparameterized describe with undefined title',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws((): unknown => ebdd.describe(undefined, fn), TypeError);
            },
        );

        it
        (
            'unparameterized describe with invalid title',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws((): unknown => ebdd.describe({ }, fn), TypeError);
            },
        );

        it
        (
            'unparameterized describe with undefined callback function',
            // @ts-expect-error
            (): void => throws((): unknown => ebdd.describe('suite', undefined), TypeError),
        );

        it
        (
            'unparameterized describe with invalid callback function',
            // @ts-expect-error
            (): void => throws((): unknown => ebdd.describe('suite', { }), TypeError),
        );

        it
        (
            'unparameterized describe with callback function accepting wrong number of arguments',
            (): void =>
            {
                const fn =
                (arg0: never): void => // eslint-disable-line @typescript-eslint/no-unused-vars
                { };
                throws
                (
                    // @ts-expect-error
                    (): unknown => ebdd.describe('suite', fn),
                    (error: unknown): boolean =>
                    error instanceof RangeError && /\b0 parameters\b/.test(error.message),
                );
            },
        );

        it
        (
            'parameterized describe with undefined title',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws((): unknown => ebdd.describe.per([0])(undefined, fn), TypeError);
            },
        );

        it
        (
            'parameterized describe with invalid title',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                // @ts-expect-error
                throws((): unknown => ebdd.describe.per([0])({ }, fn), TypeError);
            },
        );

        it
        (
            'parameterized describe with undefined callback function',
            (): void =>
            // @ts-expect-error
            throws((): unknown => ebdd.describe.per([0])('suite', undefined), TypeError),
        );

        it
        (
            'parameterized describe with invalid callback function',
            // @ts-expect-error
            (): void => throws((): unknown => ebdd.describe.per([0])('suite', { }), TypeError),
        );

        it
        (
            'simply parameterized describe with callback function accepting wrong number of ' +
            'arguments',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                throws
                (
                    (): unknown => ebdd.describe.per([0])('suite', fn),
                    (error: unknown): boolean =>
                    error instanceof RangeError && /\b1 parameter\b/.test(error.message),
                );
            },
        );

        it
        (
            'multiparameterized describe with callback function accepting wrong number of ' +
            'arguments',
            (): void =>
            {
                const fn =
                (): void =>
                { };
                throws
                (
                    (): unknown => ebdd.describe.per([0]).per([1])('suite', fn),
                    (error: unknown): boolean =>
                    error instanceof RangeError && /\b2 parameters\b/.test(error.message),
                );
            },
        );

        it
        (
            'per with undefined params argument',
            // @ts-expect-error
            (): void => throws((): unknown => ebdd.describe.per(undefined), TypeError),
        );

        it
        (
            'per with null params argument',
            // @ts-expect-error
            (): void => throws((): unknown => ebdd.describe.per(null), TypeError),
        );

        it
        (
            'per with empty array-like params argument',
            (): void => throws((): unknown => ebdd.describe.per(''), TypeError),
        );

        it
        (
            'per with invalid parameter',
            (): void =>
            {
                const paramInfo = ebdd.when(true, 42);
                // @ts-expect-error
                paramInfo.mode = 'foo';
                throws((): unknown => ebdd.describe.per([paramInfo]), TypeError);
            },
        );

        it
        (
            'per with invalid paramMapper argument',
            (): void =>
            {
                // @ts-expect-error
                throws((): unknown => ebdd.describe.per([1], 'WRONG'), TypeError);
            },
        );
    },
);
