import ExtensibleArray                                              from './extensible-array';
import TitleFormatter                                               from './title-formatter';
import { Context, Done, HookFunction, MochaGlobals, Suite, Test }   from 'mocha';

export interface AdaptableSuiteFunction extends UnparameterizedSuiteFunction
{
    readonly adapt:
    <AdaptParamListType extends unknown[]>
    (adapter: SuiteAdapter<AdaptParamListType>) => UnparameterizedSuiteFunction<AdaptParamListType>;
}

export interface AdaptableTestFunction extends UnparameterizedTestFunction
{
    readonly adapt:
    <AdaptParamListType extends unknown[]>
    (adapter: TestAdapter<AdaptParamListType>) => UnparameterizedTestFunction<AdaptParamListType>;
}

declare namespace AppendToTuple
{
    type AppendHelper
    <TupleType extends unknown[], ElementType, ExtendedTupleType = OneMore<TupleType>> =
    AsArray<
    {
        [KeyType in keyof ExtendedTupleType]:
        KeyType extends keyof TupleType ? TupleType[KeyType] : ElementType;
    }
    >;

    export type AppendToTuple<TupleType extends unknown[], ElementType> =
    AppendHelper<TupleType, ElementType>;

    type AsArray<TupleType> = TupleType extends unknown[] ? TupleType : never;

    type OneMore<TupleType extends unknown[]> =
    ((arg0: unknown, ...args: TupleType) => unknown) extends
    (...args: infer ElementType) => unknown ?
    ElementType : never;
}
type AppendToTuple<TupleType extends unknown[], ElementType> =
AppendToTuple.AppendToTuple<TupleType, ElementType>;

enum Brand
{
    NONE, XIT, XDESCRIBE, SKIP_OR_ONLY
}

export interface EBDDGlobals
{
    after:      HookFunction;
    afterEach:  HookFunction;
    before:     HookFunction;
    beforeEach: HookFunction;
    context:    AdaptableSuiteFunction;
    describe:   AdaptableSuiteFunction;
    it:         AdaptableTestFunction;
    only:       <ParamType>(param: ParamType) => ParamInfo<ParamType>;
    run?:       () => void;
    skip:       <ParamType>(param: ParamType) => ParamInfo<ParamType>;
    specify:    AdaptableTestFunction;
    when:       <ParamType>(condition: boolean, param: ParamType) => ParamInfo<ParamType>;
    xcontext:   UnparameterizedSuiteFunction;
    xdescribe:  UnparameterizedSuiteFunction;
    xit:        UnparameterizedTestFunction;
    xspecify:   UnparameterizedTestFunction;
}

export interface MochaConstructor
{
    readonly interfaces: { [InterfaceName: string]: (suite: Suite) => void; };
}

enum Mode
{
    NORMAL, ONLY, SKIP
}

export type ParamArrayLike<ParamType> = ArrayLike<ParamOrParamInfo<ParamType>>;

type ParamList<ParamListType extends readonly unknown[]> = ParamListType & { readonly mode: Mode; };

type ParamOrParamInfo<ParamType> = ParamType | ParamInfo<ParamType>;

interface ParameterizableFunction<SubType extends ParameterizableFunction<SubType>>
{
    readonly only:  SubType;
    readonly per:   <ParamType>(params: ParamArrayLike<ParamType>) => unknown;
    readonly skip:  SubType;
    readonly when:  (condition: boolean) => SubType;
}

export interface ParameterizedSuiteFunction
<ParamListType extends unknown[], AdaptParamListType extends unknown[]>
extends ParameterizableFunction<ParameterizedSuiteFunction<ParamListType, AdaptParamListType>>
{
    readonly per:
    <ParamType>
    (params: ParamArrayLike<ParamType>) =>
    ParameterizedSuiteFunction<AppendToTuple<ParamListType, ParamType>, AdaptParamListType>;
    (titlePattern: string, fn: SuiteCallback<ParamListType>, ...adaptParams: AdaptParamListType):
    SpecItemArray<Suite>;
}

export interface ParameterizedTestFunction
<ParamListType extends unknown[], AdaptParamListType extends unknown[]>
extends ParameterizableFunction<ParameterizedTestFunction<ParamListType, AdaptParamListType>>
{
    readonly per:
    <ParamType>
    (params: ParamArrayLike<ParamType>) =>
    ParameterizedTestFunction<AppendToTuple<ParamListType, ParamType>, AdaptParamListType>;
    (titlePattern: string, fn: TestCallback<ParamListType>, ...adaptParams: AdaptParamListType):
    SpecItemArray<Test>;
}

type SuiteAdapter<AdaptParamListType extends unknown[]> =
(this: Suite, ...adaptParams: AdaptParamListType) => void;

/** Callback function used for suites. */
type SuiteCallback<ParamListType extends unknown[] = []> =
(this: Suite, ...params: ParamListType) => void;

type TestAdapter<AdaptParamListType extends unknown[]> =
(this: Test, ...adaptParams: AdaptParamListType) => void;

/** Callback function used for tests and hooks. */
type TestCallback<ParamListType extends unknown[] = []> =
((this: Context, ...params: ParamListType) => PromiseLike<any>) |
((this: Context, ...paramsAndDone: AppendToTuple<ParamListType, Done>) => void);

export interface UnparameterizedSuiteFunction<AdaptParamListType extends unknown[] = []>
extends ParameterizableFunction<UnparameterizedSuiteFunction<AdaptParamListType>>
{
    readonly per:
    <ParamType>
    (params: ParamArrayLike<ParamType>) =>
    ParameterizedSuiteFunction<[ParamType], AdaptParamListType>;
    (title: string, fn: SuiteCallback, ...adaptParams: AdaptParamListType): Suite;
}

export interface UnparameterizedTestFunction<AdaptParamListType extends unknown[] = []>
extends ParameterizableFunction<UnparameterizedTestFunction<AdaptParamListType>>
{
    readonly per:
    <ParamType>
    (params: ParamArrayLike<ParamType>) =>
    ParameterizedTestFunction<[ParamType], AdaptParamListType>;
    (title: string, fn: TestCallback, ...adaptParams: AdaptParamListType): Test;
}

export class ParamInfo<ParamType>
{
    public constructor(public readonly param: ParamType, public readonly mode: Mode)
    {
        if (param instanceof ParamInfo)
        {
            const message =
            'Invalid parameter. skip(...), only(...) and when(...) expressions cannot be nested.';
            throw TypeError(message);
        }
    }
}

export class SpecItemArray<SpecItemType extends Suite | Test> extends ExtensibleArray<SpecItemType>
{
    public parent: Suite | undefined;
    public timeout(): number;
    public timeout(ms: string | number): this;
    public timeout(ms?: string | number): number | this
    {
        if (arguments.length)
        {
            for (const specItem of this)
                specItem.timeout(ms!);
            return this;
        }
        {
            let sum = 0;
            for (const specItem of this)
                sum += specItem.timeout();
            const ms = sum / this.length;
            return ms;
        }
    }
}

export function bindArguments
<ThisType, ArgListType extends unknown[], RetType>
(fn: (this: ThisType, ...args: ArgListType) => RetType, args: ArgListType):
(this: ThisType) => RetType
{
    const boundFn =
    function (this: ThisType): RetType
    {
        const returnValue = fn.apply(this, args);
        return returnValue;
    };
    return boundFn;
}

export function bindArgumentsButLast
<ThisType, ArgListType extends unknown[], LastArgType, RetType>
(
    fn:     (this: ThisType, ...args: AppendToTuple<ArgListType, LastArgType>) => RetType,
    args:   ArgListType,
):
(this: ThisType, lastArg: LastArgType) => RetType
{
    const boundFn =
    function (this: ThisType, lastArg: LastArgType): RetType
    {
        const argsAndLast = [...args, lastArg] as AppendToTuple<ArgListType, LastArgType>;
        const returnValue = fn.apply(this, argsAndLast);
        return returnValue;
    };
    return boundFn;
}

export function createInterface(context: MochaGlobals | EBDDGlobals): void
{
    function createAdaptableSuiteFunction(): AdaptableSuiteFunction
    {
        function adapt
        <AdaptParamListType extends unknown[]>
        (adapter: SuiteAdapter<AdaptParamListType>):
        UnparameterizedSuiteFunction<AdaptParamListType>
        {
            validateAdapter(adapter);
            const describe = createUnparameterizedSuiteFunction(Mode.NORMAL, Brand.NONE, adapter);
            return describe;
        }

        const describe = createUnparameterizedSuiteFunction() as AdaptableSuiteFunction;
        (describe as { adapt: typeof adapt; }).adapt = adapt;
        return describe;
    }

    function createAdaptableTestFunction(): AdaptableTestFunction
    {
        function adapt
        <AdaptParamListType extends unknown[]>
        (adapter: TestAdapter<AdaptParamListType>):
        UnparameterizedTestFunction<AdaptParamListType>
        {
            validateAdapter(adapter);
            const it = createUnparameterizedTestFunction(Mode.NORMAL, Brand.NONE, adapter);
            return it;
        }

        const it = createUnparameterizedTestFunction() as AdaptableTestFunction;
        (it as { adapt: typeof adapt; }).adapt = adapt;
        return it;
    }

    function createParameterizedSuiteFunction
    <ParamListType extends unknown[], AdaptParamListType extends unknown[]>
    (
        baseParamLists: readonly ParamList<ParamListType>[],
        brand:          Brand,
        adapter:        SuiteAdapter<AdaptParamListType> | undefined,
    ):
    ParameterizedSuiteFunction<ParamListType, AdaptParamListType>
    {
        function skip(brand: Brand): ParameterizedSuiteFunction<ParamListType, AdaptParamListType>
        {
            const describe =
            createParameterizedSuiteFunction(skipAll(baseParamLists), brand, adapter);
            return describe;
        }

        function stub
        (
            titlePattern:   string,
            fn:             SuiteCallback<ParamListType>,
            ...adaptParams: AdaptParamListType
        ):
        SpecItemArray<Suite>
        {
            validateTitlePattern(titlePattern);
            const paramCount = baseParamLists[0].length;
            validateSuiteCallback(fn, paramCount);
            const titleFormatter = new TitleFormatter(titlePattern, paramCount);
            const suites = new SpecItemArray<Suite>();
            for (const paramList of baseParamLists)
            {
                const createSuite = getCreateSuite(paramList.mode);
                const title = titleFormatter(paramList);
                const fnWrapper = bindArguments(fn, paramList);
                const suite = createSuite(title, fnWrapper);
                suites.parent = suite.parent;
                if (adapter)
                    adapter.apply(suite, adaptParams);
                suites.push(suite);
            }
            return suites;
        }

        stub.per =
        <ParamType>
        (params: ParamArrayLike<ParamType>):
        ParameterizedSuiteFunction<AppendToTuple<ParamListType, ParamType>, AdaptParamListType> =>
        {
            const paramLists = multiplyParams(params, baseParamLists);
            const describe = createParameterizedSuiteFunction(paramLists, brand, adapter);
            return describe;
        };

        stub.when =
        (condition: boolean): ParameterizedSuiteFunction<ParamListType, AdaptParamListType> =>
        condition ? describe : skip(brand);

        const describe =
        makeParameterizableFunction
        (
            stub,
            (): ParameterizedSuiteFunction<ParamListType, AdaptParamListType> =>
            skip(Brand.SKIP_OR_ONLY),
            (): ParameterizedSuiteFunction<ParamListType, AdaptParamListType> =>
            createParameterizedSuiteFunction(onlyAll(baseParamLists), Brand.SKIP_OR_ONLY, adapter),
            brand,
        );
        return describe;
    }

    function createParameterizedTestFunction
    <ParamListType extends unknown[], AdaptParamListType extends unknown[]>
    (
        baseParamLists: readonly ParamList<ParamListType>[],
        brand:          Brand,
        adapter:        TestAdapter<AdaptParamListType> | undefined,
    ):
    ParameterizedTestFunction<ParamListType, AdaptParamListType>
    {
        function skip(brand: Brand): ParameterizedTestFunction<ParamListType, AdaptParamListType>
        {
            const it = createParameterizedTestFunction(skipAll(baseParamLists), brand, adapter);
            return it;
        }

        function stub
        (titlePattern: string, fn: TestCallback<ParamListType>, ...adaptParams: AdaptParamListType):
        SpecItemArray<Test>
        {
            validateTitlePattern(titlePattern);
            const paramCount = baseParamLists[0].length;
            validateTestCallback(fn, paramCount);
            const titleFormatter = new TitleFormatter(titlePattern, paramCount);
            const tests = new SpecItemArray<Test>();
            for (const paramList of baseParamLists)
            {
                const createTest = getCreateTest(paramList.mode);
                const title = titleFormatter(paramList);
                let fnWrapper: TestCallback;
                if (fn.length === paramCount)
                {
                    type TestCallbackType =
                    (this: Context, ...params: ParamListType) => PromiseLike<any> | void;
                    fnWrapper = bindArguments(fn as TestCallbackType, paramList);
                }
                else
                {
                    type TestCallbackType =
                    (this: Context, ...paramsAndDone: AppendToTuple<ParamListType, Done>) => void;
                    fnWrapper = bindArgumentsButLast(fn as TestCallbackType, paramList);
                }
                const test = createTest(title, fnWrapper);
                tests.parent = test.parent;
                if (adapter)
                    adapter.apply(test, adaptParams);
                tests.push(test);
            }
            return tests;
        }

        stub.per =
        <ParamType>
        (params: ParamArrayLike<ParamType>):
        ParameterizedTestFunction<AppendToTuple<ParamListType, ParamType>, AdaptParamListType> =>
        {
            const paramLists = multiplyParams(params, baseParamLists);
            const it = createParameterizedTestFunction(paramLists, brand, adapter);
            return it;
        };

        stub.when =
        (condition: boolean): ParameterizedTestFunction<ParamListType, AdaptParamListType> =>
        condition ? it : skip(brand);

        const it =
        makeParameterizableFunction
        (
            stub,
            (): ParameterizedTestFunction<ParamListType, AdaptParamListType> =>
            skip(Brand.SKIP_OR_ONLY),
            (): ParameterizedTestFunction<ParamListType, AdaptParamListType> =>
            createParameterizedTestFunction(onlyAll(baseParamLists), Brand.SKIP_OR_ONLY, adapter),
            brand,
        );
        return it;
    }

    function createUnparameterizedSuiteFunction
    <AdaptParamListType extends unknown[]>
    (
        baseMode:   Mode = Mode.NORMAL,
        brand:      Brand = Brand.NONE,
        adapter?:   SuiteAdapter<AdaptParamListType>,
    ):
    UnparameterizedSuiteFunction<AdaptParamListType>
    {
        function stub(title: string, fn: SuiteCallback, ...adaptParams: AdaptParamListType): Suite
        {
            validateTitle(title);
            validateSuiteCallback(fn, 0);
            const createSuite = getCreateSuite(baseMode);
            const suite = createSuite(title, fn);
            if (adapter)
                adapter.apply(suite, adaptParams);
            return suite;
        }

        stub.per =
        <ParamType>
        (params: ParamArrayLike<ParamType>):
        ParameterizedSuiteFunction<[ParamType], AdaptParamListType> =>
        {
            const paramLists = createParamLists(params, baseMode);
            const describe = createParameterizedSuiteFunction(paramLists, brand, adapter);
            return describe;
        };

        stub.when =
        (condition: boolean): UnparameterizedSuiteFunction<AdaptParamListType> =>
        condition ? describe : createUnparameterizedSuiteFunction(Mode.SKIP, brand, adapter);

        const describe =
        makeParameterizableFunction
        (
            stub,
            (): UnparameterizedSuiteFunction<AdaptParamListType> =>
            createUnparameterizedSuiteFunction(Mode.SKIP, Brand.SKIP_OR_ONLY, adapter),
            (): UnparameterizedSuiteFunction<AdaptParamListType> =>
            createUnparameterizedSuiteFunction
            (maxMode(Mode.ONLY, baseMode), Brand.SKIP_OR_ONLY, adapter),
            brand,
        );
        return describe;
    }

    function createUnparameterizedTestFunction
    <AdaptParamListType extends unknown[]>
    (
        baseMode:   Mode = Mode.NORMAL,
        brand:      Brand = Brand.NONE,
        adapter?:   TestAdapter<AdaptParamListType>,
    ):
    UnparameterizedTestFunction<AdaptParamListType>
    {
        function stub(title: string, fn: TestCallback, ...adaptParams: AdaptParamListType): Test
        {
            validateTitle(title);
            validateTestCallback(fn, 0);
            const createTest = getCreateTest(baseMode);
            const test = createTest(title, fn);
            if (adapter)
                adapter.apply(test, adaptParams);
            return test;
        }

        stub.per =
        <ParamType>
        (params: ParamArrayLike<ParamType>):
        ParameterizedTestFunction<[ParamType], AdaptParamListType> =>
        {
            const paramLists = createParamLists(params, baseMode);
            const it = createParameterizedTestFunction(paramLists, brand, adapter);
            return it;
        };

        stub.when =
        (condition: boolean): UnparameterizedTestFunction<AdaptParamListType> =>
        condition ? it : createUnparameterizedTestFunction(Mode.SKIP, brand, adapter);

        const it =
        makeParameterizableFunction
        (
            stub,
            (): UnparameterizedTestFunction<AdaptParamListType> =>
            createUnparameterizedTestFunction(Mode.SKIP, Brand.SKIP_OR_ONLY, adapter),
            (): UnparameterizedTestFunction<AdaptParamListType> =>
            createUnparameterizedTestFunction
            (maxMode(Mode.ONLY, baseMode), Brand.SKIP_OR_ONLY, adapter),
            brand,
        );
        return it;
    }

    function getCreateSuite(mode: Mode): (title: string, fn: SuiteCallback) => Suite
    {
        switch (mode)
        {
        default:
            return bddDescribe;
        case Mode.ONLY:
            return bddDescribe.only;
        case Mode.SKIP:
            return bddDescribe.skip as (title: string, fn: SuiteCallback) => Suite;
        }
    }

    function getCreateTest(mode: Mode): (title: string, fn: TestCallback) => Test
    {
        switch (mode)
        {
        default:
            return bddIt;
        case Mode.ONLY:
            return bddIt.only;
        case Mode.SKIP:
            return bddXit;
        }
    }

    const { describe: bddDescribe, it: bddIt } = context as MochaGlobals;

    const bddXit = (title: string): Test => bddIt(title);

    context.describe = context.context =
    createAdaptableSuiteFunction();
    context.xdescribe = context.xcontext =
    createUnparameterizedSuiteFunction(Mode.SKIP, Brand.XDESCRIBE);
    context.it = context.specify =
    createAdaptableTestFunction();
    context.xit = context.xspecify =
    createUnparameterizedTestFunction(Mode.SKIP, Brand.XIT);
    (context as EBDDGlobals).only =
    <ParamType>(param: ParamType): ParamInfo<ParamType> => new ParamInfo(param, Mode.ONLY);
    (context as EBDDGlobals).skip =
    <ParamType>(param: ParamType): ParamInfo<ParamType> => new ParamInfo(param, Mode.SKIP);
    (context as EBDDGlobals).when =
    <ParamType>(condition: boolean, param: ParamType): ParamInfo<ParamType> =>
    new ParamInfo(param, condition ? Mode.NORMAL : Mode.SKIP);
}

function createParamLists
<ParamType>(params: ParamArrayLike<ParamType>, baseMode: Mode): readonly ParamList<[ParamType]>[]
{
    if (params !== undefined && params !== null)
    {
        const paramLists =
        Array.prototype.map.call
        <
        ParamArrayLike<ParamType>,
        [(paramOrParamInfo: ParamOrParamInfo<ParamType>) => ParamList<[ParamType]>],
        ParamList<[ParamType]>[]
        >
        (
            params,
            (paramOrParamInfo: ParamOrParamInfo<ParamType>): ParamList<[ParamType]> =>
            {
                let paramList: [ParamType];
                let mode: Mode;
                if (paramOrParamInfo instanceof ParamInfo)
                {
                    paramList = [paramOrParamInfo.param];
                    const paramInfoMode = paramOrParamInfo.mode;
                    if (typeof paramInfoMode !== 'number' || !(paramInfoMode in Mode))
                    {
                        const message = 'Invalid parameter.';
                        throw TypeError(message);
                    }
                    mode = maxMode(paramInfoMode, baseMode);
                }
                else
                {
                    paramList = [paramOrParamInfo];
                    mode = baseMode;
                }
                makeParamList(paramList, mode);
                return paramList;
            },
        );
        if (paramLists.length)
            return paramLists;
    }
    const message = 'Argument is not a nonempty array-like object.';
    throw TypeError(message);
}

export function initEBDD({ interfaces }: MochaConstructor): (suite: Suite) => void
{
    const { bdd } = interfaces;
    const ebdd =
    (suite: Suite): void =>
    {
        bdd(suite);
        suite.on('pre-require', createInterface);
    };
    interfaces.ebdd = ebdd;
    return ebdd;
}

function makeParamList
<ParamListType extends unknown[]>(paramList: ParamListType, mode: Mode):
asserts paramList is ParamList<ParamListType>
{
    (paramList as ParamListType & { mode: Mode; }).mode = mode;
}

function makeParameterizableFunction
<ParameterizableFunctionType extends Function>
(
    stub:   Omit<ParameterizableFunctionType, 'only' | 'skip'>,
    skip:   () => ParameterizableFunctionType,
    only:   () => ParameterizableFunctionType,
    brand:  Brand,
):
ParameterizableFunctionType
{
    switch (brand)
    {
    case Brand.NONE:
        break;
    case Brand.XIT:
        skip = only =
        (): never =>
        {
            const message = 'Do not use .skip or .only on a test defined with xit or xspecify.';
            throw Error(message);
        };
        break;
    case Brand.XDESCRIBE:
        skip = only =
        (): never =>
        {
            const message =
            'Do not use .skip or .only on a suite defined with xdescribe or xcontext.';
            throw Error(message);
        };
        break;
    case Brand.SKIP_OR_ONLY:
        skip = only =
        (): never =>
        {
            const message = 'Only one of .skip and .only may be specified.';
            throw Error(message);
        };
        break;
    }
    const descriptors =
    {
        only: { configurable: true, enumerable: true, get: only },
        skip: { configurable: true, enumerable: true, get: skip },
    };
    const parameterizableFn: ParameterizableFunctionType =
    Object.defineProperties(stub, descriptors);
    return parameterizableFn;
}

const maxMode: (...modes: Mode[]) => Mode = Math.max;

function multiplyParams
<ParamType, ParamListType extends unknown[]>
(params: ParamArrayLike<ParamType>, baseParamLists: readonly ParamList<ParamListType>[]):
readonly ParamList<AppendToTuple<ParamListType, ParamType>>[]
{
    const newParamLists = createParamLists(params, Mode.NORMAL);
    const paramLists: ParamList<AppendToTuple<ParamListType, ParamType>>[] = [];
    for (const baseParamList of baseParamLists)
    {
        const baseMode = baseParamList.mode;
        for (const newParamList of newParamLists)
        {
            const paramList =
            [...baseParamList, ...newParamList] as AppendToTuple<ParamListType, ParamType>;
            const mode = maxMode(newParamList.mode, baseMode);
            makeParamList(paramList, mode);
            paramLists.push(paramList);
        }
    }
    return paramLists;
}

function onlyAll
<ParamListType extends unknown[]>
(baseParamLists: readonly ParamList<ParamListType>[]): readonly ParamList<ParamListType>[]
{
    const paramLists =
    baseParamLists.map
    (
        (baseParamList: ParamList<ParamListType>): ParamList<ParamListType> =>
        {
            const paramList = [...baseParamList] as ParamListType;
            const mode = maxMode(Mode.ONLY, baseParamList.mode);
            makeParamList(paramList, mode);
            return paramList;
        },
    );
    return paramLists;
}

function skipAll
<ParamListType extends unknown[]>
(baseParamLists: readonly ParamList<ParamListType>[]): readonly ParamList<ParamListType>[]
{
    const paramLists =
    baseParamLists.map
    (
        (baseParamList: ParamList<ParamListType>): ParamList<ParamListType> =>
        {
            const paramList = [...baseParamList] as ParamListType;
            makeParamList(paramList, Mode.SKIP);
            return paramList;
        },
    );
    return paramLists;
}

function validateAdapter(adapter: Function): void
{
    if (typeof adapter !== 'function')
    {
        const message = 'Argument `adapter` is not a function.';
        throw TypeError(message);
    }
}

function validateSuiteCallback(fn: Function, expectedLength: number): void
{
    if (typeof fn !== 'function')
    {
        const message = 'Argument `fn` is not a function.';
        throw TypeError(message);
    }
    const { length } = fn;
    if (length !== expectedLength)
    {
        const message =
        `The suite callback function should accept ${expectedLength} parameters, but it accepts ` +
        `${length}.`;
        throw RangeError(message);
    }
}

function validateTestCallback(fn: Function, expectedMinLength: number): void
{
    if (typeof fn !== 'function')
    {
        const message = 'Argument `fn` is not a function.';
        throw TypeError(message);
    }
    const { length } = fn;
    if (length !== expectedMinLength && length !== expectedMinLength + 1)
    {
        const message =
        `The test callback function should accept ${expectedMinLength} parameters, or ` +
        `${expectedMinLength + 1} if it uses a done callback, but it accepts ${length}.`;
        throw RangeError(message);
    }
}

function validateTitle(title: string): void
{
    if (typeof title !== 'string')
    {
        const message = 'Argument `title` is not a string.';
        throw TypeError(message);
    }
}

function validateTitlePattern(titlePattern: string): void
{
    if (typeof titlePattern !== 'string')
    {
        const message = 'Argument `titlePattern` is not a string.';
        throw TypeError(message);
    }
}
