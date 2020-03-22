import TitleFormatter                                               from './title-formatter';
import { Context, Done, HookFunction, MochaGlobals, Suite, Test }   from 'mocha';

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
    context:    UnparameterizedSuiteFunction;
    describe:   UnparameterizedSuiteFunction;
    it:         UnparameterizedTestFunction;
    only:       <ParamType>(param: ParamType) => ParamInfo<ParamType>;
    run?:       () => void;
    skip:       <ParamType>(param: ParamType) => ParamInfo<ParamType>;
    specify:    UnparameterizedTestFunction;
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

export interface ParameterizedSuiteFunction<ParamListType extends unknown[]>
extends ParameterizableFunction<ParameterizedSuiteFunction<ParamListType>>
{
    readonly per:
    <ParamType>(params: ParamArrayLike<ParamType>) =>
    ParameterizedSuiteFunction<AppendToTuple<ParamListType, ParamType>>;
    (titlePattern: string, fn: SuiteCallback<ParamListType>): SpecItemArray<Suite>;
}

export interface ParameterizedTestFunction<ParamListType extends unknown[]>
extends ParameterizableFunction<ParameterizedTestFunction<ParamListType>>
{
    readonly per:
    <ParamType>(params: ParamArrayLike<ParamType>) =>
    ParameterizedTestFunction<AppendToTuple<ParamListType, ParamType>>;
    (titlePattern: string, fn: TestCallback<ParamListType>): SpecItemArray<Test>;
}

export interface SpecItemArray<SpecItemType extends Suite | Test> extends Array<SpecItemType>
{
    timeout(): number;
    timeout(ms: string | number): this;
}

/** Callback function used for suites. */
type SuiteCallback<ParamListType extends unknown[] = []> =
(this: Suite, ...params: ParamListType) => void;

/** Callback function used for tests and hooks. */
type TestCallback<ParamListType extends unknown[] = []> =
((this: Context, ...params: ParamListType) => PromiseLike<any>) |
((this: Context, ...paramsAndDone: AppendToTuple<ParamListType, Done>) => void);

export interface UnparameterizedSuiteFunction
extends ParameterizableFunction<UnparameterizedSuiteFunction>
{
    readonly per:
    <ParamType>(params: ParamArrayLike<ParamType>) => ParameterizedSuiteFunction<[ParamType]>;
    (title: string, fn: SuiteCallback): Suite;
}

export interface UnparameterizedTestFunction
extends ParameterizableFunction<UnparameterizedTestFunction>
{
    readonly per:
    <ParamType>(params: ParamArrayLike<ParamType>) => ParameterizedTestFunction<[ParamType]>;
    (title: string, fn: TestCallback): Test;
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

const SpecItemArrayPrototype: SpecItemArray<Suite | Test> =
Object.create
(
    Array.prototype,
    {
        timeout:
        {
            configurable: true,
            value(ms?: string | number): any
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
            },
            writable: true,
        } as
        PropertyDescriptor & ThisType<(Suite | Test)[]>,
    },
);

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
    function createParameterizedSuiteFunction
    <ParamListType extends unknown[]>
    (baseParamLists: readonly ParamList<ParamListType>[], brand: Brand):
    ParameterizedSuiteFunction<ParamListType>
    {
        function skip(brand: Brand): ParameterizedSuiteFunction<ParamListType>
        {
            const describe = createParameterizedSuiteFunction(skipAll(baseParamLists), brand);
            return describe;
        }

        function stub(titlePattern: string, fn: SuiteCallback<ParamListType>): SpecItemArray<Suite>
        {
            validateTitlePattern(titlePattern);
            const paramCount = baseParamLists[0].length;
            validateSuiteCallback(fn, paramCount);
            const titleFormatter = new TitleFormatter(titlePattern, paramCount);
            const suites: SpecItemArray<Suite> = Object.create(SpecItemArrayPrototype);
            for (const paramList of baseParamLists)
            {
                const createSuite = getCreateSuite(paramList.mode);
                const title = titleFormatter(paramList);
                const fnWrapper = bindArguments(fn, paramList);
                const suite = createSuite(title, fnWrapper);
                suites.push(suite);
            }
            return suites;
        }

        stub.per =
        <ParamType>(params: ParamArrayLike<ParamType>):
        ParameterizedSuiteFunction<AppendToTuple<ParamListType, ParamType>> =>
        {
            const paramLists = multiplyParams(params, baseParamLists);
            const describe = createParameterizedSuiteFunction(paramLists, brand);
            return describe;
        };

        stub.when =
        (condition: boolean): ParameterizedSuiteFunction<ParamListType> =>
        condition ? describe : skip(brand);

        const describe =
        makeParameterizableFunction
        (
            stub,
            (): ParameterizedSuiteFunction<ParamListType> => skip(Brand.SKIP_OR_ONLY),
            (): ParameterizedSuiteFunction<ParamListType> =>
            createParameterizedSuiteFunction(onlyAll(baseParamLists), Brand.SKIP_OR_ONLY),
            brand,
        );
        return describe;
    }

    function createParameterizedTestFunction
    <ParamListType extends unknown[]>
    (baseParamLists: readonly ParamList<ParamListType>[], brand: Brand):
    ParameterizedTestFunction<ParamListType>
    {
        function skip(brand: Brand): ParameterizedTestFunction<ParamListType>
        {
            const it = createParameterizedTestFunction(skipAll(baseParamLists), brand);
            return it;
        }

        function stub(titlePattern: string, fn: TestCallback<ParamListType>): SpecItemArray<Test>
        {
            validateTitlePattern(titlePattern);
            const paramCount = baseParamLists[0].length;
            validateTestCallback(fn, paramCount);
            const titleFormatter = new TitleFormatter(titlePattern, paramCount);
            const tests: SpecItemArray<Test> = Object.create(SpecItemArrayPrototype);
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
                tests.push(test);
            }
            return tests;
        }

        stub.per =
        <ParamType>(params: ParamArrayLike<ParamType>):
        ParameterizedTestFunction<AppendToTuple<ParamListType, ParamType>> =>
        {
            const paramLists = multiplyParams(params, baseParamLists);
            const it = createParameterizedTestFunction(paramLists, brand);
            return it;
        };

        stub.when =
        (condition: boolean): ParameterizedTestFunction<ParamListType> =>
        condition ? it : skip(brand);

        const it =
        makeParameterizableFunction
        (
            stub,
            (): ParameterizedTestFunction<ParamListType> => skip(Brand.SKIP_OR_ONLY),
            (): ParameterizedTestFunction<ParamListType> =>
            createParameterizedTestFunction(onlyAll(baseParamLists), Brand.SKIP_OR_ONLY),
            brand,
        );
        return it;
    }

    function createUnparameterizedSuiteFunction
    (baseMode: Mode = Mode.NORMAL, brand: Brand = Brand.NONE): UnparameterizedSuiteFunction
    {
        function stub(title: string, fn: SuiteCallback): Suite
        {
            validateTitle(title);
            validateSuiteCallback(fn, 0);
            const createSuite = getCreateSuite(baseMode);
            const suite = createSuite(title, fn);
            return suite;
        }

        stub.per =
        <ParamType>(params: ParamArrayLike<ParamType>): ParameterizedSuiteFunction<[ParamType]> =>
        {
            const paramLists = createParamLists(params, baseMode);
            const describe = createParameterizedSuiteFunction(paramLists, brand);
            return describe;
        };

        stub.when =
        (condition: boolean): UnparameterizedSuiteFunction =>
        condition ? describe : createUnparameterizedSuiteFunction(Mode.SKIP, brand);

        const describe =
        makeParameterizableFunction
        (
            stub,
            (): UnparameterizedSuiteFunction =>
            createUnparameterizedSuiteFunction(Mode.SKIP, Brand.SKIP_OR_ONLY),
            (): UnparameterizedSuiteFunction =>
            createUnparameterizedSuiteFunction(maxMode(Mode.ONLY, baseMode), Brand.SKIP_OR_ONLY),
            brand,
        );
        return describe;
    }

    function createUnparameterizedTestFunction
    (baseMode: Mode = Mode.NORMAL, brand: Brand = Brand.NONE): UnparameterizedTestFunction
    {
        function stub(title: string, fn: TestCallback): Test
        {
            validateTitle(title);
            validateTestCallback(fn, 0);
            const createTest = getCreateTest(baseMode);
            const test = createTest(title, fn);
            return test;
        }

        stub.per =
        <ParamType>(params: ParamArrayLike<ParamType>): ParameterizedTestFunction<[ParamType]> =>
        {
            const paramLists = createParamLists(params, baseMode);
            const it = createParameterizedTestFunction(paramLists, brand);
            return it;
        };

        stub.when =
        (condition: boolean): UnparameterizedTestFunction =>
        condition ? it : createUnparameterizedTestFunction(Mode.SKIP, brand);

        const it =
        makeParameterizableFunction
        (
            stub,
            (): UnparameterizedTestFunction =>
            createUnparameterizedTestFunction(Mode.SKIP, Brand.SKIP_OR_ONLY),
            (): UnparameterizedTestFunction =>
            createUnparameterizedTestFunction(maxMode(Mode.ONLY, baseMode), Brand.SKIP_OR_ONLY),
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
    createUnparameterizedSuiteFunction();
    context.xdescribe = context.xcontext =
    createUnparameterizedSuiteFunction(Mode.SKIP, Brand.XDESCRIBE);
    context.it = context.specify =
    createUnparameterizedTestFunction();
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
