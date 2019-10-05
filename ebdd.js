// EBDD 0.4.0 – https://github.com/fasttime/EBDD

(function () {
    'use strict';

    var TitleFormatter = /** @class */ (function () {
        function TitleFormatter(titlePattern, paramCount) {
            function titleFormatter(params) {
                function formatChunk(chunk) {
                    if (typeof chunk === 'string')
                        return chunk;
                    var value = params[chunk.paramIndex];
                    for (var _i = 0, chunk_1 = chunk; _i < chunk_1.length; _i++) {
                        var propName = chunk_1[_i];
                        if (value === undefined || value === null)
                            return undefined;
                        value = value[propName];
                    }
                    return value;
                }
                var title = chunks.map(formatChunk).join('');
                return title;
            }
            var chunks = createChunks(titlePattern, paramCount);
            return titleFormatter;
        }
        return TitleFormatter;
    }());
    function createChunks(titlePattern, paramCount) {
        function findNextPlaceholder() {
            var rankMatch;
            var start;
            for (;;) {
                rankMatch = rankRegExp.exec(titlePattern);
                if (!rankMatch)
                    return null;
                start = rankMatch.index;
                var prevChar = titlePattern[start - 1];
                if (prevChar !== '\\')
                    break;
                rankRegExp.lastIndex = start + 1;
            }
            var rank = rankMatch[1];
            var paramIndex = rank ? rank - 1 : 0;
            var keys = [];
            var index = rankRegExp.lastIndex;
            var propNameMatch;
            while (propNameMatch = propNameRegExp.exec(titlePattern.slice(index))) {
                var escapedPropName = void 0;
                var propName = propNameMatch[1] ||
                    propNameMatch[2] ||
                    ((escapedPropName = propNameMatch[3]) != null ?
                        escapedPropName : propNameMatch[4])
                        .replace(/\\([^])/g, '$1');
                keys.push(propName);
                index += propNameMatch[0].length;
            }
            rankRegExp.lastIndex = index;
            var placeholder = makePlaceholder(keys, start, index, paramIndex);
            validatePlaceholder(placeholder, !rank);
            return placeholder;
        }
        function getRawPlaceholder(_a) {
            var start = _a.start, end = _a.end;
            var rawPlaceholder = titlePattern.substring(start, end);
            return rawPlaceholder;
        }
        function pushStaticChunk(start) {
            if (end < start) {
                var chunk = titlePattern.substring(end, start).replace(/\\#/g, '#');
                chunks.push(chunk);
            }
        }
        function validatePlaceholder(placeholder, rankless) {
            if (rankless) {
                if (paramCount > 1) {
                    var rawPlaceholder = getRawPlaceholder(placeholder);
                    var rankSpecification = void 0;
                    switch (paramCount) {
                        case 2:
                            rankSpecification = '#1 or #2';
                            break;
                        case 3:
                            rankSpecification = '#1, #2 or #3';
                            break;
                        default:
                            rankSpecification = "#1, #2, \u2026 #" + paramCount;
                            break;
                    }
                    var message = "The placeholder " + rawPlaceholder + " is ambiguous because there are " + paramCount + " " +
                        ("parameters. Use " + rankSpecification + " instead of # to refer to a specific ") +
                        'parameter.';
                    throw Error(message);
                }
            }
            else {
                if (placeholder.paramIndex >= paramCount) {
                    var rawPlaceholder = getRawPlaceholder(placeholder);
                    var predicate = paramCount === 1 ? 'is only one parameter' : "are only " + paramCount + " parameters";
                    var message = "The placeholder " + rawPlaceholder + " is invalid because there " + predicate + ".";
                    throw Error(message);
                }
            }
        }
        var rankRegExp = /#([1-9]\d*)?(?![$\w\u0080-\uffff])/g;
        var chunks = [];
        var end = 0;
        {
            var placeholder = void 0;
            while (placeholder = findNextPlaceholder()) {
                var start = placeholder.start;
                pushStaticChunk(start);
                chunks.push(placeholder);
                (end = placeholder.end);
            }
        }
        pushStaticChunk(titlePattern.length);
        return chunks;
    }
    function makePlaceholder(keys, start, end, paramIndex) {
        var placeholder = keys;
        placeholder.start = start;
        placeholder.end = end;
        placeholder.paramIndex = paramIndex;
        return placeholder;
    }
    var propNameRegExp = /^\.((?!\d)[$\w\u0080-\uffff]+)|^\[(?:(0|-?[1-9]\d*)|"((?:[^\\"]|\\[^])*)"|'((?:[^\\']|\\[^])*)')]/;

    var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };
    var Brand;
    (function (Brand) {
        Brand[Brand["NONE"] = 0] = "NONE";
        Brand[Brand["XIT"] = 1] = "XIT";
        Brand[Brand["XDESCRIBE"] = 2] = "XDESCRIBE";
        Brand[Brand["SKIP_OR_ONLY"] = 3] = "SKIP_OR_ONLY";
    })(Brand || (Brand = {}));
    var Mode;
    (function (Mode) {
        Mode[Mode["NORMAL"] = 0] = "NORMAL";
        Mode[Mode["ONLY"] = 1] = "ONLY";
        Mode[Mode["SKIP"] = 2] = "SKIP";
    })(Mode || (Mode = {}));
    var ParamInfo = /** @class */ (function () {
        function ParamInfo(param, mode) {
            this.param = param;
            this.mode = mode;
            if (param instanceof ParamInfo) {
                var message = 'Invalid parameter. skip(...), only(...) and when(...) expressions cannot be nested.';
                throw TypeError(message);
            }
        }
        return ParamInfo;
    }());
    var SpecItemArrayPrototype = Object.create(Array.prototype, {
        timeout: {
            configurable: true,
            value: function (ms) {
                if (arguments.length) {
                    for (var _i = 0, _a = this; _i < _a.length; _i++) {
                        var specItem = _a[_i];
                        specItem.timeout(ms);
                    }
                    return this;
                }
                {
                    var sum = 0;
                    for (var _b = 0, _c = this; _b < _c.length; _b++) {
                        var specItem = _c[_b];
                        sum += specItem.timeout();
                    }
                    var ms_1 = sum / this.length;
                    return ms_1;
                }
            },
            writable: true,
        },
    });
    function bindArguments(fn, args) {
        var boundFn = function () {
            var returnValue = fn.apply(this, args);
            return returnValue;
        };
        return boundFn;
    }
    function bindArgumentsButLast(fn, args) {
        var boundFn = function (lastArg) {
            var argsAndLast = __spreadArrays(args, [lastArg]);
            var returnValue = fn.apply(this, argsAndLast);
            return returnValue;
        };
        return boundFn;
    }
    function createInterface(context) {
        function createParameterizedSuiteFunction(baseParamLists, brand) {
            function skip(brand) {
                var describe = createParameterizedSuiteFunction(skipAll(baseParamLists), brand);
                return describe;
            }
            function stub(titlePattern, fn) {
                validateTitlePattern(titlePattern);
                var paramCount = baseParamLists[0].length;
                validateSuiteCallback(fn, paramCount);
                var titleFormatter = new TitleFormatter(titlePattern, paramCount);
                var suites = Object.create(SpecItemArrayPrototype);
                for (var _i = 0, baseParamLists_1 = baseParamLists; _i < baseParamLists_1.length; _i++) {
                    var paramList = baseParamLists_1[_i];
                    var createSuite = getCreateSuite(paramList.mode);
                    var title = titleFormatter(paramList);
                    var fnWrapper = bindArguments(fn, paramList);
                    var suite_1 = createSuite(title, fnWrapper);
                    suites.push(suite_1);
                }
                return suites;
            }
            stub.per =
                function (params) {
                    var paramLists = multiplyParams(params, baseParamLists);
                    var describe = createParameterizedSuiteFunction(paramLists, brand);
                    return describe;
                };
            stub.when =
                function (condition) {
                    return condition ? describe : skip(brand);
                };
            var describe = makeParameterizableFunction(stub, function () { return skip(Brand.SKIP_OR_ONLY); }, function () {
                return createParameterizedSuiteFunction(onlyAll(baseParamLists), Brand.SKIP_OR_ONLY);
            }, brand);
            return describe;
        }
        function createParameterizedTestFunction(baseParamLists, brand) {
            function skip(brand) {
                var it = createParameterizedTestFunction(skipAll(baseParamLists), brand);
                return it;
            }
            function stub(titlePattern, fn) {
                validateTitlePattern(titlePattern);
                var paramCount = baseParamLists[0].length;
                validateTestCallback(fn, paramCount);
                var titleFormatter = new TitleFormatter(titlePattern, paramCount);
                var tests = Object.create(SpecItemArrayPrototype);
                for (var _i = 0, baseParamLists_2 = baseParamLists; _i < baseParamLists_2.length; _i++) {
                    var paramList = baseParamLists_2[_i];
                    var createTest = getCreateTest(paramList.mode);
                    var title = titleFormatter(paramList);
                    var fnWrapper = void 0;
                    if (fn.length === paramCount) {
                        fnWrapper = bindArguments(fn, paramList);
                    }
                    else {
                        fnWrapper = bindArgumentsButLast(fn, paramList);
                    }
                    var test_1 = createTest(title, fnWrapper);
                    tests.push(test_1);
                }
                return tests;
            }
            stub.per =
                function (params) {
                    var paramLists = multiplyParams(params, baseParamLists);
                    var it = createParameterizedTestFunction(paramLists, brand);
                    return it;
                };
            stub.when =
                function (condition) {
                    return condition ? it : skip(brand);
                };
            var it = makeParameterizableFunction(stub, function () { return skip(Brand.SKIP_OR_ONLY); }, function () {
                return createParameterizedTestFunction(onlyAll(baseParamLists), Brand.SKIP_OR_ONLY);
            }, brand);
            return it;
        }
        function createUnparameterizedSuiteFunction(baseMode, brand) {
            if (baseMode === void 0) { baseMode = Mode.NORMAL; }
            if (brand === void 0) { brand = Brand.NONE; }
            function stub(title, fn) {
                validateTitle(title);
                validateSuiteCallback(fn, 0);
                var createSuite = getCreateSuite(baseMode);
                var suite = createSuite(title, fn);
                return suite;
            }
            stub.per =
                function (params) {
                    var paramLists = createParamLists(params, baseMode);
                    var describe = createParameterizedSuiteFunction(paramLists, brand);
                    return describe;
                };
            stub.when =
                function (condition) {
                    return condition ? describe : createUnparameterizedSuiteFunction(Mode.SKIP, brand);
                };
            var describe = makeParameterizableFunction(stub, function () {
                return createUnparameterizedSuiteFunction(Mode.SKIP, Brand.SKIP_OR_ONLY);
            }, function () {
                return createUnparameterizedSuiteFunction(maxMode(Mode.ONLY, baseMode), Brand.SKIP_OR_ONLY);
            }, brand);
            return describe;
        }
        function createUnparameterizedTestFunction(baseMode, brand) {
            if (baseMode === void 0) { baseMode = Mode.NORMAL; }
            if (brand === void 0) { brand = Brand.NONE; }
            function stub(title, fn) {
                validateTitle(title);
                validateTestCallback(fn, 0);
                var createTest = getCreateTest(baseMode);
                var test = createTest(title, fn);
                return test;
            }
            stub.per =
                function (params) {
                    var paramLists = createParamLists(params, baseMode);
                    var it = createParameterizedTestFunction(paramLists, brand);
                    return it;
                };
            stub.when =
                function (condition) {
                    return condition ? it : createUnparameterizedTestFunction(Mode.SKIP, brand);
                };
            var it = makeParameterizableFunction(stub, function () {
                return createUnparameterizedTestFunction(Mode.SKIP, Brand.SKIP_OR_ONLY);
            }, function () {
                return createUnparameterizedTestFunction(maxMode(Mode.ONLY, baseMode), Brand.SKIP_OR_ONLY);
            }, brand);
            return it;
        }
        function getCreateSuite(mode) {
            switch (mode) {
                default:
                    return bddDescribe;
                case Mode.ONLY:
                    return bddDescribe.only;
                case Mode.SKIP:
                    return bddDescribe.skip;
            }
        }
        function getCreateTest(mode) {
            switch (mode) {
                default:
                    return bddIt;
                case Mode.ONLY:
                    return bddIt.only;
                case Mode.SKIP:
                    return bddXit;
            }
        }
        var bddDescribe = context.describe;
        var bddIt = context.it;
        var bddXit = function (title) { return bddIt(title); };
        context.describe = context.context =
            createUnparameterizedSuiteFunction();
        context.xdescribe = context.xcontext =
            createUnparameterizedSuiteFunction(Mode.SKIP, Brand.XDESCRIBE);
        context.it = context.specify =
            createUnparameterizedTestFunction();
        context.xit = context.xspecify =
            createUnparameterizedTestFunction(Mode.SKIP, Brand.XIT);
        context.only =
            function (param) { return new ParamInfo(param, Mode.ONLY); };
        context.skip =
            function (param) { return new ParamInfo(param, Mode.SKIP); };
        context.when =
            function (condition, param) {
                return new ParamInfo(param, condition ? Mode.NORMAL : Mode.SKIP);
            };
    }
    function createParamLists(params, baseMode) {
        if (params !== undefined && params !== null) {
            var paramLists = Array.prototype.map.call(params, function (paramOrParamInfo) {
                var stub;
                var mode;
                if (paramOrParamInfo instanceof ParamInfo) {
                    stub = [paramOrParamInfo.param];
                    var paramInfoMode = paramOrParamInfo.mode;
                    if (typeof paramInfoMode !== 'number' || !(paramInfoMode in Mode)) {
                        var message_1 = 'Invalid parameter.';
                        throw TypeError(message_1);
                    }
                    mode = maxMode(paramInfoMode, baseMode);
                }
                else {
                    stub = [paramOrParamInfo];
                    mode = baseMode;
                }
                var paramList = makeParamList(stub, mode);
                return paramList;
            });
            if (paramLists.length)
                return paramLists;
        }
        var message = 'Argument is not a nonempty array-like object.';
        throw TypeError(message);
    }
    function initEBDD(_a) {
        var interfaces = _a.interfaces;
        var bdd = interfaces.bdd;
        var ebdd = function (suite) {
            bdd(suite);
            suite.on('pre-require', createInterface);
        };
        interfaces.ebdd = ebdd;
        return ebdd;
    }
    function makeParamList(stub, mode) {
        var paramList = stub;
        paramList.mode = mode;
        return paramList;
    }
    function makeParameterizableFunction(stub, skip, only, brand) {
        switch (brand) {
            case Brand.XIT:
                skip = only =
                    function () {
                        var message = 'Do not use .skip or .only on a test defined with xit or xspecify.';
                        throw Error(message);
                    };
                break;
            case Brand.XDESCRIBE:
                skip = only =
                    function () {
                        var message = 'Do not use .skip or .only on a suite defined with xdescribe or xcontext.';
                        throw Error(message);
                    };
                break;
            case Brand.SKIP_OR_ONLY:
                skip = only =
                    function () {
                        var message = 'Only one of .skip and .only may be specified.';
                        throw Error(message);
                    };
                break;
        }
        var descriptors = {
            only: { configurable: true, enumerable: true, get: only },
            skip: { configurable: true, enumerable: true, get: skip },
        };
        var parameterizableFn = Object.defineProperties(stub, descriptors);
        return parameterizableFn;
    }
    var maxMode = Math.max;
    function multiplyParams(params, baseParamLists) {
        var newParamLists = createParamLists(params, Mode.NORMAL);
        var paramLists = [];
        for (var _i = 0, baseParamLists_3 = baseParamLists; _i < baseParamLists_3.length; _i++) {
            var baseParamList = baseParamLists_3[_i];
            var baseMode = baseParamList.mode;
            for (var _a = 0, newParamLists_1 = newParamLists; _a < newParamLists_1.length; _a++) {
                var newParamList = newParamLists_1[_a];
                var paramListStub = __spreadArrays(baseParamList, newParamList);
                var mode = maxMode(newParamList.mode, baseMode);
                var paramList = makeParamList(paramListStub, mode);
                paramLists.push(paramList);
            }
        }
        return paramLists;
    }
    function onlyAll(baseParamLists) {
        var paramLists = baseParamLists.map(function (baseParamList) {
            var paramListStub = __spreadArrays(baseParamList);
            var mode = maxMode(Mode.ONLY, baseParamList.mode);
            var paramList = makeParamList(paramListStub, mode);
            return paramList;
        });
        return paramLists;
    }
    function skipAll(baseParamLists) {
        var paramLists = baseParamLists.map(function (baseParamList) {
            var stub = __spreadArrays(baseParamList);
            var paramList = makeParamList(stub, Mode.SKIP);
            return paramList;
        });
        return paramLists;
    }
    function validateSuiteCallback(fn, expectedLength) {
        if (typeof fn !== 'function') {
            var message = 'Argument `fn` is not a function.';
            throw TypeError(message);
        }
        var length = fn.length;
        if (length !== expectedLength) {
            var message = "The suite callback function should accept " + expectedLength + " parameters, but it accepts " +
                (length + ".");
            throw RangeError(message);
        }
    }
    function validateTestCallback(fn, expectedMinLength) {
        if (typeof fn !== 'function') {
            var message = 'Argument `fn` is not a function.';
            throw TypeError(message);
        }
        var length = fn.length;
        if (length !== expectedMinLength && length !== expectedMinLength + 1) {
            var message = "The test callback function should accept " + expectedMinLength + " parameters, or " +
                (expectedMinLength + 1 + " if it uses a done callback, but it accepts " + length + ".");
            throw RangeError(message);
        }
    }
    function validateTitle(title) {
        if (typeof title !== 'string') {
            var message = 'Argument `title` is not a string.';
            throw TypeError(message);
        }
    }
    function validateTitlePattern(titlePattern) {
        if (typeof titlePattern !== 'string') {
            var message = 'Argument `titlePattern` is not a string.';
            throw TypeError(message);
        }
    }

    var mochaConstructor;
    if (typeof Mocha === 'function')
        mochaConstructor = Mocha;
    else if (typeof require === 'function')
        mochaConstructor = require('mocha');
    else
        throw Error('Mocha not found.');
    var ebdd = initEBDD(mochaConstructor);
    if (typeof module !== 'undefined')
        module.exports = ebdd;

}());
