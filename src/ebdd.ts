import { bindArguments, bindArgumentsButLast }  from './bind-arguments';
import ExtensibleArray                          from './extensible-array';
import TitleFormatter                           from './title-formatter';
import type
{
    Context,
    Done,
    HookFunction,
    MochaGlobals,
    MochaOptions,
    PendingTestFunction,
    Suite,
    SuiteFunction,
    Test,
    TestFunction,
    interfaces,
}
from 'mocha';

declare global
{
    interface Mocha
    {
        constructor:
        {
            readonly Suite:         typeof Suite;
            readonly Test:          typeof Test;
            readonly interfaces:    typeof interfaces;
            new (options?: MochaOptions): Mocha;
        };
    }

    namespace Mocha
    {
        interface ExclusiveSuiteFunction extends UnparameterizedSuiteFunction
        { }

        interface ExclusiveTestFunction extends UnparameterizedTestFunction
        { }

        interface InterfaceContributions
        {
            ebdd: never;
        }

        interface MochaGlobals extends EBDDGlobals
        { }

        interface PendingSuiteFunction extends UnparameterizedSuiteFunction
        { }

        interface PendingTestFunction extends UnparameterizedTestFunction
        { }

        interface SuiteFunction extends UnparameterizedSuiteFunction
        { }

        interface TestFunction extends UnparameterizedTestFunction
        { }

        namespace interfaces
        {
            function ebdd(suite: Suite): void;
        }
    }

    const only: <ParamType>(param: ParamType) => ParamInfo<ParamType>;
    const skip: <ParamType>(param: ParamType) => ParamInfo<ParamType>;
    const when: <ParamType>(condition: boolean, param: ParamType) => ParamInfo<ParamType>;
}

enum Brand
{
    NONE, XIT, XDESCRIBE, SKIP_OR_ONLY,
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

enum Mode
{
    NORMAL, ONLY, SKIP,
}

export type ParamCollection<ParamType> = ArrayLike<ParamOrParamInfo<ParamType>>;

type ParamList<ParamListType extends readonly unknown[]> = ParamListType & { readonly mode: Mode; };

export type ParamMapper<InParamType, OutParamType> = (param: InParamType) => OutParamType;

export type ParamOrParamInfo<ParamType> = ParamType | ParamInfo<ParamType>;

interface ParameterizableFunction<SubType extends ParameterizableFunction<SubType>>
{
    readonly only: SubType;
    readonly skip: SubType;
    readonly when: (condition: boolean) => SubType;
    per<ParamType>(params: ParamCollection<ParamType>): unknown;
    per
    <InParamType, OutParamType>
    (params: ParamCollection<InParamType>, paramMapper: ParamMapper<InParamType, OutParamType>):
    unknown;
}

export interface ParameterizedSuiteFunction<ParamListType extends unknown[]>
extends ParameterizableFunction<ParameterizedSuiteFunction<ParamListType>>
{
    (titlePattern: string, fn: SuiteCallback<ParamListType>): SpecItemArray<Suite>;
    per
    <ParamType>
    (params: ParamCollection<ParamType>):
    ParameterizedSuiteFunction<[...ParamListType, ParamType]>;
    per
    <InParamType, OutParamType>
    (params: ParamCollection<InParamType>, paramMapper: ParamMapper<InParamType, OutParamType>):
    ParameterizedSuiteFunction<[...ParamListType, OutParamType]>;
}

export interface ParameterizedTestFunction<ParamListType extends unknown[]>
extends ParameterizableFunction<ParameterizedTestFunction<ParamListType>>
{
    (titlePattern: string, fn: TestCallback<ParamListType>): SpecItemArray<Test>;
    per
    <ParamType>
    (params: ParamCollection<ParamType>):
    ParameterizedTestFunction<[...ParamListType, ParamType]>;
    per
    <InParamType, OutParamType>
    (params: ParamCollection<InParamType>, paramMapper: ParamMapper<InParamType, OutParamType>):
    ParameterizedTestFunction<[...ParamListType, OutParamType]>;
}

/** Callback function used for suites. */
type SuiteCallback<ParamListType extends unknown[] = []> =
(this: Suite, ...params: ParamListType) => void;

/** Callback function used for tests and hooks. */
type TestCallback<ParamListType extends unknown[] = []> =
((this: Context, ...params: ParamListType) => PromiseLike<any>) |
((this: Context, ...paramsAndDone: [...ParamListType, Done]) => void);

export interface UnparameterizedSuiteFunction
extends ParameterizableFunction<UnparameterizedSuiteFunction>
{
    (title: string, fn: SuiteCallback): Suite;
    per<ParamType>(params: ParamCollection<ParamType>): ParameterizedSuiteFunction<[ParamType]>;
    per
    <InParamType, OutParamType>
    (params: ParamCollection<InParamType>, paramMapper: ParamMapper<InParamType, OutParamType>):
    ParameterizedSuiteFunction<[OutParamType]>;
}

export interface UnparameterizedTestFunction
extends ParameterizableFunction<UnparameterizedTestFunction>
{
    (title: string, fn: TestCallback): Test;
    per<ParamType>(params: ParamCollection<ParamType>): ParameterizedTestFunction<[ParamType]>;
    per
    <InParamType, OutParamType>
    (params: ParamCollection<InParamType>, paramMapper: ParamMapper<InParamType, OutParamType>):
    ParameterizedTestFunction<[OutParamType]>;
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

function countParameters(paramCount: number): string
{
    const paramStr = `${paramCount} ${paramCount === 1 ? 'parameter' : 'parameters'}`;
    return paramStr;
}

function createBDDInterface(this: Suite, context: MochaGlobals, file: string, mocha: Mocha): void
{
    const setMaxListeners =
    (maxListeners: number): void =>
    {
        (this as { setMaxListeners?: (n: number) => Suite; }).setMaxListeners?.(maxListeners);
    };
    const { bdd } = mocha.constructor.interfaces;
    const maxListeners =
    (this as { getMaxListeners?: () => number; }).getMaxListeners !== undefined ?
    this.getMaxListeners() : (this as { _maxListeners?: number; })._maxListeners ?? 0;
    setMaxListeners(0);
    bdd(this);
    const listeners = this.listeners('pre-require');
    const bddPreRequireListener = listeners[listeners.length - 1] as typeof createBDDInterface;
    this.removeListener('pre-require', bddPreRequireListener);
    setMaxListeners(maxListeners);
    bddPreRequireListener.call(this, context, file, mocha);
}

function createEBDDInterface(this: Suite, context: MochaGlobals, file: string, mocha: Mocha): void
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
            const suites = new SpecItemArray<Suite>();
            for (const paramList of baseParamLists)
            {
                const createSuite = getCreateSuite(paramList.mode);
                const title = titleFormatter(paramList);
                const fnWrapper = bindArguments(fn, paramList);
                const suite = createSuite(title, fnWrapper);
                suites.parent = suite.parent;
                suites.push(suite);
            }
            return suites;
        }

        stub.per =
        <InParamType, OutParamType>
        (
            params:         ParamCollection<InParamType>,
            paramMapper?:   ParamMapper<InParamType, OutParamType>,
        ):
        ParameterizedSuiteFunction<[...ParamListType, OutParamType]> =>
        {
            validateParamMapper(paramMapper);
            const paramLists = multiplyParams(params, paramMapper, baseParamLists);
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
            (): ParameterizedSuiteFunction<ParamListType> =>
            skip(Brand.SKIP_OR_ONLY),
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
                    fnWrapper = bindArguments(fn as TestCallbackType, paramList as ParamListType);
                }
                else
                {
                    type TestCallbackType =
                    (this: Context, ...paramsAndDone: [...ParamListType, Done]) => void;
                    fnWrapper =
                    bindArgumentsButLast(fn as TestCallbackType, paramList as ParamListType);
                }
                const test = createTest(title, fnWrapper);
                tests.parent = test.parent;
                tests.push(test);
            }
            return tests;
        }

        stub.per =
        <InParamType, OutParamType>
        (
            params:         ParamCollection<InParamType>,
            paramMapper?:   ParamMapper<InParamType, OutParamType>,
        ):
        ParameterizedTestFunction<[...ParamListType, OutParamType]> =>
        {
            validateParamMapper(paramMapper);
            const paramLists = multiplyParams(params, paramMapper, baseParamLists);
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
            (): ParameterizedTestFunction<ParamListType> =>
            skip(Brand.SKIP_OR_ONLY),
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
        <InParamType, OutParamType>
        (
            params:         ParamCollection<InParamType>,
            paramMapper?:   ParamMapper<InParamType, OutParamType>,
        ):
        ParameterizedSuiteFunction<[OutParamType]> =>
        {
            validateParamMapper(paramMapper);
            const paramLists = createParamLists(params, paramMapper, baseMode);
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
        <InParamType, OutParamType>
        (
            params:         ParamCollection<InParamType>,
            paramMapper?:   ParamMapper<InParamType, OutParamType>,
        ):
        ParameterizedTestFunction<[OutParamType]> =>
        {
            validateParamMapper(paramMapper);
            const paramLists = createParamLists(params, paramMapper, baseMode);
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
            return bddDescribe.skip;
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

    createBDDInterface.call(this, context, file, mocha);
    const { describe: bddDescribe, it: bddIt } = context;
    const bddXit = (title: string): Test => bddIt(title);
    context.describe = context.context =
    createUnparameterizedSuiteFunction() as SuiteFunction;
    context.xdescribe = context.xcontext =
    createUnparameterizedSuiteFunction(Mode.SKIP, Brand.XDESCRIBE);
    context.it = context.specify =
    createUnparameterizedTestFunction() as TestFunction;
    context.xit = context.xspecify =
    createUnparameterizedTestFunction(Mode.SKIP, Brand.XIT) as PendingTestFunction;
    context.only =
    <ParamType>(param: ParamType): ParamInfo<ParamType> => new ParamInfo(param, Mode.ONLY);
    context.skip =
    <ParamType>(param: ParamType): ParamInfo<ParamType> => new ParamInfo(param, Mode.SKIP);
    context.when =
    <ParamType>(condition: boolean, param: ParamType): ParamInfo<ParamType> =>
    new ParamInfo(param, condition ? Mode.NORMAL : Mode.SKIP);
}

function createParamLists
<InParamType, OutParamType>
(
    params:         ParamCollection<InParamType> | undefined | null,
    paramMapper:    ParamMapper<InParamType, OutParamType> | undefined,
    baseMode:       Mode,
):
readonly ParamList<[OutParamType]>[]
{
    if (params !== undefined && params !== null)
    {
        const paramLists =
        Array.prototype.map.call
        <
        ParamCollection<InParamType>,
        [(paramOrParamInfo: ParamOrParamInfo<InParamType>) => ParamList<[OutParamType]>],
        ParamList<[OutParamType]>[]
        >
        (
            params,
            (paramOrParamInfo: ParamOrParamInfo<InParamType>): ParamList<[OutParamType]> =>
            {
                let inParam: InParamType;
                let mode: Mode;
                if (paramOrParamInfo instanceof ParamInfo)
                {
                    inParam = paramOrParamInfo.param;
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
                    inParam = paramOrParamInfo;
                    mode = baseMode;
                }
                const outParam =
                paramMapper ? paramMapper(inParam) : inParam as unknown as OutParamType;
                const paramList: [OutParamType] = [outParam];
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

export function ebdd(suite: Suite): void
{
    suite.on('pre-require', createEBDDInterface);
}

function makeParamList
<ParamListType extends unknown[]>
(paramList: ParamListType, mode: Mode):
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
    const parameterizableFn =
    Object.defineProperties(stub, descriptors) as ParameterizableFunctionType;
    return parameterizableFn;
}

const maxMode: (...modes: Mode[]) => Mode = Math.max;

function multiplyParams
<InParamType, OutParamType, ParamListType extends unknown[]>
(
    params:         ParamCollection<InParamType>,
    paramMapper:    ParamMapper<InParamType, OutParamType> | undefined,
    baseParamLists: readonly ParamList<ParamListType>[],
):
readonly ParamList<[...ParamListType, OutParamType]>[]
{
    const newParamLists = createParamLists(params, paramMapper, Mode.NORMAL);
    const paramLists: ParamList<[...ParamListType, OutParamType]>[] = [];
    for (const baseParamList of baseParamLists)
    {
        const baseMode = baseParamList.mode;
        for (const newParamList of newParamLists)
        {
            const paramList =
            [...baseParamList, ...newParamList] as [...ParamListType, OutParamType];
            const mode = maxMode(newParamList.mode, baseMode);
            makeParamList(paramList, mode);
            paramLists.push(paramList);
        }
    }
    return paramLists;
}

function onlyAll
<ParamListType extends unknown[]>
(baseParamLists: readonly ParamList<ParamListType>[]):
readonly ParamList<ParamListType>[]
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
(baseParamLists: readonly ParamList<ParamListType>[]):
readonly ParamList<ParamListType>[]
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

function validateParamMapper
<InParamType, OutParamType>(paramMapper: ParamMapper<InParamType, OutParamType> | undefined): void
{
    if (paramMapper !== undefined && typeof paramMapper !== 'function')
    {
        const message = 'Argument `paramMapper` is not a function or undefined.';
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
        `The suite callback function should accept ${countParameters(expectedLength)}, but it ` +
        `accepts ${length}.`;
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
        `The test callback function should accept ${countParameters(expectedMinLength)}, or ` +
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
