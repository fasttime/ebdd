import
{
    EBDDGlobals,
    ParamInfo,
    ParameterizedSuiteFunction,
    UnparameterizedSuiteFunction,
    createInterface,
}
from '../../src/mocha-interface';
import { deepStrictEqual, ok, strictEqual, throws }     from 'assert';
import { Suite }                                        from 'mocha';
import { SinonSpyCall, SinonStub, createSandbox, spy }  from 'sinon';

describe
(
    'EBDD suite functions',
    () =>
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
            deepStrictEqual(bddDescribeAny.firstCall.args, [title, fn]);
            strictEqual(actual, bddDescribeAny.firstCall.returnValue);
        }

        function assertBDDDescribes<ParamListType extends unknown[]>
        (
            ebddDescribeAny:    ParameterizedSuiteFunction<ParamListType>,
            bddDescribeAny:     readonly SinonStub[],
        ):
        void
        {
            const suiteCallback =
            (letter: string): void =>
            { };
            assertBDDDescribesWithParams
            (
                ebddDescribeAny,
                bddDescribeAny,
                '"#" is good',
                suiteCallback,
                ([letter]: readonly unknown[]) => `"${letter}" is good`,
                [['A'], ['B'], ['C']],
            );
        }

        function assertBDDDescribesWithParams<ParamListType extends unknown[]>
        (
            ebddDescribeAny:    ParameterizedSuiteFunction<ParamListType>,
            bddDescribeAny:     readonly SinonStub[],
            titlePattern:       string,
            suiteCallback:      (...args: any) => void,
            getExpectedTitle:   (expectedParams: readonly unknown[]) => string,
            expectedParamsList: readonly (readonly unknown[])[],
        ):
        void
        {
            interface CallCountingStub extends SinonStub
            {
                nextCallIndex?: number;
            }

            const suiteCallbackSpy = spy(suiteCallback);
            const actualDescribeReturnValue = ebddDescribeAny(titlePattern, suiteCallbackSpy);
            const uniqueBDDDescribeAny: CallCountingStub[] = [];
            const spyCalls =
            bddDescribeAny.map
            (
                (bddDescribeAny: CallCountingStub): SinonSpyCall =>
                {
                    if (uniqueBDDDescribeAny.indexOf(bddDescribeAny) < 0)
                    uniqueBDDDescribeAny.push(bddDescribeAny);
                    const nextCallIndex = bddDescribeAny.nextCallIndex || 0;
                    bddDescribeAny.nextCallIndex = nextCallIndex + 1;
                    const spyCall = bddDescribeAny.getCall(nextCallIndex);
                    return spyCall;
                },
            );

            // describe callback order
            spyCalls.reduce
            (
                (previousSpyCall: SinonSpyCall, currentSpyCall: SinonSpyCall) =>
                {
                    ok((currentSpyCall as any).calledImmediatelyAfter(previousSpyCall));
                    return currentSpyCall;
                },
            );

            // describe callback counts
            uniqueBDDDescribeAny.forEach
            (
                (bddDescribeAny: CallCountingStub) =>
                {
                    strictEqual(bddDescribeAny.callCount, bddDescribeAny.nextCallIndex);
                },
            );

            // Suite titles
            spyCalls.forEach
            (
                ({ args: [actualTitle] }: SinonSpyCall, index: number) =>
                {
                    const expectedParams = expectedParamsList[index];
                    const expectedTitle = getExpectedTitle(expectedParams);
                    strictEqual(actualTitle, expectedTitle);
                },
            );

            // Suite callback functions calls
            spyCalls.forEach
            (
                ({ args: [, actualSuiteCallback] }: SinonSpyCall, index: number) =>
                {
                    suiteCallbackSpy.resetHistory();
                    const expectedThis = { };
                    actualSuiteCallback.call(expectedThis);
                    deepStrictEqual(suiteCallbackSpy.lastCall.thisValue, expectedThis);
                    deepStrictEqual(suiteCallbackSpy.lastCall.args, expectedParamsList[index]);
                },
            );

            // Return value
            deepStrictEqual
            (
                actualDescribeReturnValue,
                spyCalls.map(({ returnValue }: SinonSpyCall) => returnValue),
            );
        }

        let bddDescribe:        SinonStub;
        let bddDescribeOnly:    SinonStub;
        let bddDescribeSkip:    SinonStub;
        let ebdd:               EBDDGlobals;

        beforeEach
        (
            () =>
            {
                interface BDDDescribe extends SinonStub
                {
                    only: SinonStub;
                    skip: SinonStub;
                }

                function newSuite(): Suite
                {
                    const suite = new Suite('abc');
                    return suite;
                }

                const sandbox = createSandbox();
                const describe = bddDescribe = sandbox.stub().callsFake(newSuite) as BDDDescribe;
                bddDescribeOnly = describe.only = sandbox.stub().callsFake(newSuite);
                bddDescribeSkip = describe.skip = sandbox.stub().callsFake(newSuite);
                const context = { describe } as unknown as EBDDGlobals;
                createInterface(context);
                ebdd = context;
            },
        );

        after
        (
            () =>
            {
                ({ bddDescribe, bddDescribeOnly, bddDescribeSkip, ebdd } = { } as any);
            },
        );

        it
        (
            'describe',
            () => assertBDDDescribe(ebdd.describe, bddDescribe),
        );

        it
        (
            'describe.only',
            () => assertBDDDescribe(ebdd.describe.only, bddDescribeOnly),
        );

        it
        (
            'describe.only.only',
            () => throws(() => void ebdd.describe.only.only, Error),
        );

        it
        (
            'describe.only.skip',
            () => throws(() => void ebdd.describe.only.skip, Error),
        );

        it
        (
            'describe.only.if(true)',
            () => assertBDDDescribe(ebdd.describe.only.if(true), bddDescribeOnly),
        );

        it
        (
            'describe.only.if(false)',
            () => assertBDDDescribe(ebdd.describe.only.if(false), bddDescribeSkip),
        );

        it
        (
            'describe.only.per([...])',
            () =>
            {
                const ebddDescribeAny =
                ebdd.describe.only.per(['A', ebdd.only('B'), ebdd.skip('C')]);
                const bddDescribeAny = [bddDescribeOnly, bddDescribeOnly, bddDescribeSkip];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
            },
        );

        it
        (
            'describe.skip',
            () => assertBDDDescribe(ebdd.describe.skip, bddDescribeSkip),
        );

        it
        (
            'describe.skip.only',
            () => throws(() => void ebdd.describe.skip.only, Error),
        );

        it
        (
            'describe.skip.skip',
            () => throws(() => void ebdd.describe.skip.skip, Error),
        );

        it
        (
            'describe.skip.if(true)',
            () => assertBDDDescribe(ebdd.describe.skip.if(true), bddDescribeSkip),
        );

        it
        (
            'describe.skip.if(false)',
            () => assertBDDDescribe(ebdd.describe.skip.if(false), bddDescribeSkip),
        );

        it
        (
            'describe.skip.per([...])',
            () =>
            {
                const ebddDescribeAny =
                ebdd.describe.skip.per(['A', ebdd.only('B'), ebdd.skip('C')]);
                const bddDescribeAny = [bddDescribeSkip, bddDescribeSkip, bddDescribeSkip];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
            },
        );

        it
        (
            'describe.if(true)',
            () => assertBDDDescribe(ebdd.describe.if(true), bddDescribe),
        );

        it
        (
            'describe.if(true).only',
            () => assertBDDDescribe(ebdd.describe.if(true).only, bddDescribeOnly),
        );

        it
        (
            'describe.if(true).skip',
            () => assertBDDDescribe(ebdd.describe.if(true).skip, bddDescribeSkip),
        );

        it
        (
            'describe.if(true).if(true)',
            () => assertBDDDescribe(ebdd.describe.if(true).if(true), bddDescribe),
        );

        it
        (
            'describe.if(true).if(false)',
            () => assertBDDDescribe(ebdd.describe.if(true).if(false), bddDescribeSkip),
        );

        it
        (
            'describe.if(true).per([...])',
            () =>
            {
                const ebddDescribeAny =
                ebdd.describe.if(true).per(['A', ebdd.only('B'), ebdd.skip('C')]);
                const bddDescribeAny = [bddDescribe, bddDescribeOnly, bddDescribeSkip];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
            },
        );

        it
        (
            'describe.if(false)',
            () => assertBDDDescribe(ebdd.describe.if(false), bddDescribeSkip),
        );

        it
        (
            'describe.if(false).only',
            () => assertBDDDescribe(ebdd.describe.if(false).only, bddDescribeSkip),
        );

        it
        (
            'describe.if(false).skip',
            () => assertBDDDescribe(ebdd.describe.if(false).skip, bddDescribeSkip),
        );

        it
        (
            'describe.if(false).if(true)',
            () => assertBDDDescribe(ebdd.describe.if(false).if(true), bddDescribeSkip),
        );

        it
        (
            'describe.if(false).if(false)',
            () => assertBDDDescribe(ebdd.describe.if(false).if(false), bddDescribeSkip),
        );

        it
        (
            'describe.if(false).per([...])',
            () =>
            {
                const ebddDescribeAny =
                ebdd.describe.if(false).per(['A', ebdd.only('B'), ebdd.skip('C')]);
                const bddDescribeAny = [bddDescribeSkip, bddDescribeSkip, bddDescribeSkip];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
            },
        );

        it
        (
            'describe.per([...]).only',
            () =>
            {
                const ebddDescribeAny =
                ebdd.describe.per(['A', ebdd.only('B'), ebdd.skip('C')]).only;
                const bddDescribeAny = [bddDescribeOnly, bddDescribeOnly, bddDescribeSkip];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
            },
        );

        it
        (
            'describe.per([...]).skip',
            () =>
            {
                const ebddDescribeAny =
                ebdd.describe.per(['A', ebdd.only('B'), ebdd.skip('C')]).skip;
                const bddDescribeAny = [bddDescribeSkip, bddDescribeSkip, bddDescribeSkip];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
            },
        );

        it
        (
            'describe.per([...]).if(true)',
            () =>
            {
                const ebddDescribeAny =
                ebdd.describe.per(['A', ebdd.only('B'), ebdd.skip('C')]).if(true);
                const bddDescribeAny = [bddDescribe, bddDescribeOnly, bddDescribeSkip];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
            },
        );

        it
        (
            'describe.per([...]).if(false)',
            () =>
            {
                const ebddDescribeAny =
                ebdd.describe.per(['A', ebdd.only('B'), ebdd.skip('C')]).if(false);
                const bddDescribeAny = [bddDescribeSkip, bddDescribeSkip, bddDescribeSkip];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
            },
        );

        it
        (
            'describe.per([...]).per([...])',
            () =>
            {
                const ebddDescribeAny =
                ebdd.describe
                .per({ 0: 3, 1: ebdd.only(7), 2: ebdd.skip(11), length: 3 })
                .per(['potatoes', ebdd.only('tomatoes'), ebdd.skip('pizzas')]);

                const bddDescribeAny =
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
                (count: number, food: string): void =>
                { };

                assertBDDDescribesWithParams
                (
                    ebddDescribeAny,
                    bddDescribeAny,
                    '#1 #2',
                    suiteCallback,
                    ([count, food]: readonly unknown[]) => `${count} ${food}`,
                    expectedParamsList,
                );
            },
        );

        it
        (
            'context',
            () => strictEqual(ebdd.context, ebdd.describe),
        );

        it
        (
            'xdescribe',
            () => assertBDDDescribe(ebdd.xdescribe, bddDescribeSkip),
        );

        it
        (
            'xdescribe.only',
            () => throws(() => void ebdd.xdescribe.only, Error),
        );

        it
        (
            'xdescribe.skip',
            () => throws(() => void ebdd.xdescribe.skip, Error),
        );

        it
        (
            'xdescribe.if(true)',
            () => assertBDDDescribe(ebdd.xdescribe.if(true), bddDescribeSkip),
        );

        it
        (
            'xdescribe.if(false)',
            () => assertBDDDescribe(ebdd.xdescribe.if(false), bddDescribeSkip),
        );

        it
        (
            'xdescribe.per([...])',
            () =>
            {
                const ebddDescribeAny = ebdd.xdescribe.per(['A', ebdd.only('B'), ebdd.skip('C')]);
                const bddDescribeAny = [bddDescribeSkip, bddDescribeSkip, bddDescribeSkip];

                assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
            },
        );

        it
        (
            'xcontext',
            () => strictEqual(ebdd.xcontext, ebdd.xdescribe),
        );

        it
        (
            'unparameterized describe with undefined title',
            () =>
            {
                const fn =
                (): void =>
                { };
                throws(() => ebdd.describe(undefined as any, fn), TypeError);
            },
        );

        it
        (
            'unparameterized describe with invalid title',
            () =>
            {
                const fn =
                (): void =>
                { };
                throws(() => ebdd.describe({ } as any, fn), TypeError);
            },
        );

        it
        (
            'unparameterized describe with undefined callback function',
            () => throws(() => ebdd.describe('suite', undefined as any), TypeError),
        );

        it
        (
            'unparameterized describe with invalid callback function',
            () => throws(() => ebdd.describe('suite', { } as any), TypeError),
        );

        it
        (
            'unparameterized describe with callback function accepting wrong number of arguments',
            () =>
            {
                const fn =
                (arg0: never): void =>
                { };
                throws(() => ebdd.describe('suite', fn as any), RangeError);
            },
        );

        it
        (
            'parameterized describe with undefined title',
            () =>
            {
                const fn =
                (): void =>
                { };
                throws(() => ebdd.describe.per([0])(undefined as any, fn), TypeError);
            },
        );

        it
        (
            'parameterized describe with invalid title',
            () =>
            {
                const fn =
                (): void =>
                { };
                throws(() => ebdd.describe.per([0])({ } as any, fn), TypeError);
            },
        );

        it
        (
            'parameterized describe with undefined callback function',
            () => throws(() => ebdd.describe.per([0])('suite', undefined as any), TypeError),
        );

        it
        (
            'parameterized describe with invalid callback function',
            () => throws(() => ebdd.describe.per([0])('suite', { } as any), TypeError),
        );

        it
        (
            'parameterized describe with callback function accepting wrong number of arguments',
            () =>
            {
                const fn =
                (): void =>
                { };
                throws(() => ebdd.describe.per([0])('suite', fn as any), RangeError);
            },
        );

        it
        (
            'per with undefined argument',
            () => throws(() => ebdd.describe.per(undefined as any), TypeError),
        );

        it
        (
            'per with null argument',
            () => throws(() => ebdd.describe.per(null as any), TypeError),
        );

        it
        (
            'per with empty array-like',
            () => throws(() => ebdd.describe.per('' as any), TypeError),
        );

        it
        (
            'per with invalid parameter',
            () =>
            {
                const paramInfo = new ParamInfo(42, 'foo' as any);
                throws(() => ebdd.describe.per([paramInfo as any]), TypeError);
            },
        );
    },
);
