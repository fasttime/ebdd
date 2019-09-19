import
{ EBDDGlobals, ParamInfo, ParameterizedTestFunction, UnparameterizedTestFunction, createInterface }
from '../../src/mocha-interface';
import { deepStrictEqual, ok, strictEqual, throws }     from 'assert';
import { Done, Test }                                   from 'mocha';
import { SinonSpyCall, SinonStub, createSandbox, spy }  from 'sinon';

describe
(
    'EBDD test functions',
    () =>
    {
        function assertBDDIt(ebddItAny: UnparameterizedTestFunction, bddItAny: SinonStub): void
        {
            const title = '123';
            {
                const fn =
                (): void =>
                { };
                const actualItReturnValue = ebddItAny(title, fn);
                ok(bddItAny.calledOnce);
                const { lastCall } = bddItAny;
                deepStrictEqual(lastCall.args, [title, fn]);
                strictEqual(actualItReturnValue, lastCall.returnValue);
            }
            {
                const fn =
                (done: Done): void =>
                { };
                const actualItReturnValue = ebddItAny(title, fn);
                ok(bddItAny.calledTwice);
                const { lastCall } = bddItAny;
                deepStrictEqual(lastCall.args, [title, fn]);
                strictEqual(actualItReturnValue, lastCall.returnValue);
            }
        }

        function assertBDDIts<ParamListType extends unknown[]>
        (ebddItAny: ParameterizedTestFunction<ParamListType>, bddItAny: readonly SinonStub[]):
        void
        {
            {
                const testCallback =
                (letter: string): void =>
                { };
                assertBDDItsWithParams
                (
                    ebddItAny,
                    bddItAny,
                    '"@" is good',
                    testCallback,
                    ([letter]: readonly unknown[]) => `"${letter}" is good`,
                    [['A'], ['B'], ['C']],
                    [],
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
                    bddItAny,
                    '"@" is good',
                    testCallback,
                    ([letter]: readonly unknown[]) => `"${letter}" is good`,
                    [['A'], ['B'], ['C']],
                    [done],
                );
            }
        }

        function assertBDDItsWithParams<ParamListType extends unknown[]>
        (
            ebddItAny:          ParameterizedTestFunction<ParamListType>,
            bddItAny:           readonly SinonStub[],
            titlePattern:       string,
            testCallback:       (...args: any) => void,
            getExpectedTitle:   (expectedParams: readonly unknown[]) => string,
            expectedParamsList: readonly (readonly unknown[])[],
            extraArgs:          readonly unknown[],
        ):
        void
        {
            interface CallCountingStub extends SinonStub
            {
                nextCallIndex?: number;
            }

            const testCallbackSpy = spy(testCallback);
            const actualItReturnValue = ebddItAny(titlePattern, testCallbackSpy);
            const uniqueBDDItAny: CallCountingStub[] = [];
            const spyCalls =
            bddItAny.map
            (
                (bddItAny: CallCountingStub): SinonSpyCall =>
                {
                    if (uniqueBDDItAny.indexOf(bddItAny) < 0)
                        uniqueBDDItAny.push(bddItAny);
                    const nextCallIndex = bddItAny.nextCallIndex || 0;
                    bddItAny.nextCallIndex = nextCallIndex + 1;
                    const spyCall = bddItAny.getCall(nextCallIndex);
                    return spyCall;
                },
            );

            // it callback order
            spyCalls.reduce
            (
                (previousSpyCall: SinonSpyCall, currentSpyCall: SinonSpyCall) =>
                {
                    ok((currentSpyCall as any).calledImmediatelyAfter(previousSpyCall));
                    return currentSpyCall;
                },
            );

            // it callback counts
            uniqueBDDItAny.forEach
            (
                (bddItAny: CallCountingStub) =>
                {
                    strictEqual(bddItAny.callCount, bddItAny.nextCallIndex);
                },
            );

            // Test titles
            spyCalls.forEach
            (
                ({ args: [actualTitle] }: SinonSpyCall, index: number) =>
                {
                    const expectedParams = expectedParamsList[index];
                    const expectedTitle = getExpectedTitle(expectedParams);
                    strictEqual(actualTitle, expectedTitle);
                },
            );

            // Test callback functions calls
            spyCalls.forEach
            (
                ({ args: [, actualTestCallback] }: SinonSpyCall, index: number) =>
                {
                    testCallbackSpy.resetHistory();
                    const expectedThis = { };
                    actualTestCallback.call(expectedThis, ...extraArgs);
                    deepStrictEqual(testCallbackSpy.lastCall.thisValue, expectedThis);
                    deepStrictEqual
                    (testCallbackSpy.lastCall.args, [...expectedParamsList[index], ...extraArgs]);
                },
            );

            // Return value
            deepStrictEqual
            (actualItReturnValue, spyCalls.map(({ returnValue }: SinonSpyCall) => returnValue));
        }

        let bddIt:      SinonStub;
        let bddItOnly:  SinonStub;
        let bddItSkip:  SinonStub;
        let ebdd:       EBDDGlobals;

        beforeEach
        (
            () =>
            {
                interface BDDIt extends SinonStub
                {
                    only: SinonStub;
                    skip: SinonStub;
                }

                function newTest(): Test
                {
                    const test = new Test('abc');
                    return test;
                }

                const sandbox = createSandbox();
                const it = bddIt = sandbox.stub().callsFake(newTest) as BDDIt;
                bddItOnly = it.only = sandbox.stub().callsFake(newTest);
                bddItSkip = it.skip = sandbox.stub().callsFake(newTest);
                const context = { it } as unknown as EBDDGlobals;
                createInterface(context);
                ebdd = context;
            },
        );

        after
        (
            () =>
            {
                ({ bddIt, bddItOnly, bddItSkip, ebdd } = { } as any);
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
            'it.only.if(true)',
            () => assertBDDIt(ebdd.it.only.if(true), bddItOnly),
        );

        it
        (
            'it.only.if(false)',
            () => assertBDDIt(ebdd.it.only.if(false), bddItSkip),
        );

        it
        (
            'it.only.per([...])',
            () =>
            {
                const ebddItAny = ebdd.it.only.per(['A', ebdd.only('B'), ebdd.skip('C')]);
                const bddItAny = [bddItOnly, bddItOnly, bddItSkip];

                assertBDDIts(ebddItAny, bddItAny);
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
            'it.skip.if(true)',
            () => assertBDDIt(ebdd.it.skip.if(true), bddItSkip),
        );

        it
        (
            'it.skip.if(false)',
            () => assertBDDIt(ebdd.it.skip.if(false), bddItSkip),
        );

        it
        (
            'it.skip.per([...])',
            () =>
            {
                const ebddItAny = ebdd.it.skip.per(['A', ebdd.only('B'), ebdd.skip('C')]);
                const bddItAny = [bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddItAny);
            },
        );

        it
        (
            'it.if(true)',
            () => assertBDDIt(ebdd.it.if(true), bddIt),
        );

        it
        (
            'it.if(true).only',
            () => assertBDDIt(ebdd.it.if(true).only, bddItOnly),
        );

        it
        (
            'it.if(true).skip',
            () => assertBDDIt(ebdd.it.if(true).skip, bddItSkip),
        );

        it
        (
            'it.if(true).if(true)',
            () => assertBDDIt(ebdd.it.if(true).if(true), bddIt),
        );

        it
        (
            'it.if(true).if(false)',
            () => assertBDDIt(ebdd.it.if(true).if(false), bddItSkip),
        );

        it
        (
            'it.if(true).per([...])',
            () =>
            {
                const ebddItAny = ebdd.it.if(true).per(['A', ebdd.only('B'), ebdd.skip('C')]);
                const bddItAny = [bddIt, bddItOnly, bddItSkip];

                assertBDDIts(ebddItAny, bddItAny);
            },
        );

        it
        (
            'it.if(false)',
            () => assertBDDIt(ebdd.it.if(false), bddItSkip),
        );

        it
        (
            'it.if(false).only',
            () => assertBDDIt(ebdd.it.if(false).only, bddItSkip),
        );

        it
        (
            'it.if(false).skip',
            () => assertBDDIt(ebdd.it.if(false).skip, bddItSkip),
        );

        it
        (
            'it.if(false).if(true)',
            () => assertBDDIt(ebdd.it.if(false).if(true), bddItSkip),
        );

        it
        (
            'it.if(false).if(false)',
            () => assertBDDIt(ebdd.it.if(false).if(false), bddItSkip),
        );

        it
        (
            'it.if(false).per([...])',
            () =>
            {
                const ebddItAny = ebdd.it.if(false).per(['A', ebdd.only('B'), ebdd.skip('C')]);
                const bddItAny = [bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddItAny);
            },
        );

        it
        (
            'it.per([...]).only',
            () =>
            {
                const ebddItAny = ebdd.it.per(['A', ebdd.only('B'), ebdd.skip('C')]).only;
                const bddItAny = [bddItOnly, bddItOnly, bddItSkip];

                assertBDDIts(ebddItAny, bddItAny);
            },
        );

        it
        (
            'it.per([...]).skip',
            () =>
            {
                const ebddItAny = ebdd.it.per(['A', ebdd.only('B'), ebdd.skip('C')]).skip;
                const bddItAny = [bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddItAny);
            },
        );

        it
        (
            'it.per([...]).if(true)',
            () =>
            {
                const ebddItAny = ebdd.it.per(['A', ebdd.only('B'), ebdd.skip('C')]).if(true);
                const bddItAny = [bddIt, bddItOnly, bddItSkip];

                assertBDDIts(ebddItAny, bddItAny);
            },
        );

        it
        (
            'it.per([...]).if(false)',
            () =>
            {
                const ebddItAny = ebdd.it.per(['A', ebdd.only('B'), ebdd.skip('C')]).if(false);
                const bddItAny = [bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddItAny);
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

                const bddItAny =
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
                    bddItAny,
                    '@1 @2',
                    testCallback,
                    ([count, food]: readonly unknown[]) => `${count} ${food}`,
                    expectedParamsList,
                    [],
                );
            },
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
            'xit.if(true)',
            () => assertBDDIt(ebdd.xit.if(true), bddItSkip),
        );

        it
        (
            'xit.if(false)',
            () => assertBDDIt(ebdd.xit.if(false), bddItSkip),
        );

        it
        (
            'xit.per([...])',
            () =>
            {
                const ebddItAny = ebdd.xit.per(['A', ebdd.only('B'), ebdd.skip('C')]);
                const bddItAny = [bddItSkip, bddItSkip, bddItSkip];

                assertBDDIts(ebddItAny, bddItAny);
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
                throws(() => ebdd.it(undefined as any, fn), TypeError);
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
                throws(() => ebdd.it({ } as any, fn), TypeError);
            },
        );

        it
        (
            'unparameterized it with undefined callback function',
            () => throws(() => ebdd.it('test', undefined as any), TypeError),
        );

        it
        (
            'unparameterized it with invalid callback function',
            () => throws(() => ebdd.it('test', { } as any), TypeError),
        );

        it
        (
            'unparameterized it with callback function accepting wrong number of arguments',
            () =>
            {
                const fn =
                (arg0: never, arg1: never): void =>
                { };
                throws(() => ebdd.it('test', fn as any), RangeError);
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
                throws(() => ebdd.it.per([0])(undefined as any, fn), TypeError);
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
                throws(() => ebdd.it.per([0])({ } as any, fn), TypeError);
            },
        );

        it
        (
            'parameterized it with undefined callback function',
            () => throws(() => ebdd.it.per([0])('test', undefined as any), TypeError),
        );

        it
        (
            'parameterized it with invalid callback function',
            () => throws(() => ebdd.it.per([0])('test', { } as any), TypeError),
        );

        it
        (
            'parameterized it with callback function accepting wrong number of arguments',
            () =>
            {
                const fn =
                (): void =>
                { };
                throws(() => ebdd.it.per([0])('test', fn as any), RangeError);
            },
        );

        it
        (
            'per with undefined argument',
            () => throws(() => ebdd.it.per(undefined as any), TypeError),
        );

        it
        (
            'per with null argument',
            () => throws(() => ebdd.it.per(null as any), TypeError),
        );

        it
        (
            'per with empty array-like',
            () => throws(() => ebdd.it.per('' as any), TypeError),
        );

        it
        (
            'per with invalid parameter',
            () =>
            {
                const paramInfo = new ParamInfo(42, 'foo' as any);
                throws(() => ebdd.it.per([paramInfo as any]), TypeError);
            },
        );
    },
);
