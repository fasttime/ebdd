(function (Mocha, sinon) {
    'use strict';

    var Mocha__default = 'default' in Mocha ? Mocha['default'] : Mocha;

    /* eslint-env browser */
    /* global mocha */
    mocha.setup({ checkLeaks: true, reporter: MochaBar, ui: 'bdd' });
    addEventListener('DOMContentLoaded', function () {
        mocha.run();
    });

    var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };
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

    var ExtensibleArray = function () { };
    ExtensibleArray.prototype = Array.prototype;

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
            var placeholder = [];
            var index = rankRegExp.lastIndex;
            var propNameMatch;
            while (propNameMatch = propNameRegExp.exec(titlePattern.slice(index))) {
                var escapedPropName = void 0;
                var propName = propNameMatch[1] ||
                    propNameMatch[2] ||
                    ((escapedPropName = propNameMatch[3]) != null ?
                        escapedPropName : propNameMatch[4])
                        .replace(/\\([^])/g, '$1');
                placeholder.push(propName);
                index += propNameMatch[0].length;
            }
            rankRegExp.lastIndex = index;
            makePlaceholder(placeholder, start, index, paramIndex);
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
    function makePlaceholder(placeholder, start, end, paramIndex) {
        placeholder.start = start;
        placeholder.end = end;
        placeholder.paramIndex = paramIndex;
    }
    var propNameRegExp = /^\.((?!\d)[$\w\u0080-\uffff]+)|^\[(?:(0|-?[1-9]\d*)|"((?:[^\\"]|\\[^])*)"|'((?:[^\\']|\\[^])*)')]/;

    var __extends = (undefined && undefined.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __spreadArrays$1 = (undefined && undefined.__spreadArrays) || function () {
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
    var SpecItemArray = /** @class */ (function (_super) {
        __extends(SpecItemArray, _super);
        function SpecItemArray() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SpecItemArray.prototype.timeout = function (ms) {
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
        };
        return SpecItemArray;
    }(ExtensibleArray));
    function createBDDInterface(context, file, mocha) {
        var _this = this;
        var _a;
        var setMaxListeners = function (maxListeners) {
            var _a, _b;
            (_b = (_a = _this).setMaxListeners) === null || _b === void 0 ? void 0 : _b.call(_a, maxListeners);
        };
        var bdd = mocha.constructor.interfaces.bdd;
        var maxListeners = this.getMaxListeners !== undefined ?
            this.getMaxListeners() : (_a = this._maxListeners) !== null && _a !== void 0 ? _a : 0;
        setMaxListeners(0);
        bdd(this);
        var listeners = this.listeners('pre-require');
        var bddPreRequireListener = listeners[listeners.length - 1];
        this.removeListener('pre-require', bddPreRequireListener);
        setMaxListeners(maxListeners);
        bddPreRequireListener.call(this, context, file, mocha);
    }
    function createEBDDInterface(context, file, mocha) {
        function createAdaptableSuiteFunction() {
            function adapt(adapter) {
                validateAdapter(adapter);
                var describe = createUnparameterizedSuiteFunction(Mode.NORMAL, Brand.NONE, adapter);
                return describe;
            }
            var describe = createUnparameterizedSuiteFunction();
            describe.adapt = adapt;
            return describe;
        }
        function createAdaptableTestFunction() {
            function adapt(adapter) {
                validateAdapter(adapter);
                var it = createUnparameterizedTestFunction(Mode.NORMAL, Brand.NONE, adapter);
                return it;
            }
            var it = createUnparameterizedTestFunction();
            it.adapt = adapt;
            return it;
        }
        function createParameterizedSuiteFunction(baseParamLists, brand, adapter) {
            function skip(brand) {
                var describe = createParameterizedSuiteFunction(skipAll(baseParamLists), brand, adapter);
                return describe;
            }
            function stub(titlePattern, fn) {
                var adaptParams = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    adaptParams[_i - 2] = arguments[_i];
                }
                validateTitlePattern(titlePattern);
                var paramCount = baseParamLists[0].length;
                validateSuiteCallback(fn, paramCount);
                var titleFormatter = new TitleFormatter(titlePattern, paramCount);
                var suites = new SpecItemArray();
                for (var _a = 0, baseParamLists_1 = baseParamLists; _a < baseParamLists_1.length; _a++) {
                    var paramList = baseParamLists_1[_a];
                    var createSuite = getCreateSuite(paramList.mode);
                    var title = titleFormatter(paramList);
                    var fnWrapper = bindArguments(fn, paramList);
                    var suite_1 = createSuite(title, fnWrapper);
                    suites.parent = suite_1.parent;
                    if (adapter)
                        adapter.apply(suite_1, adaptParams);
                    suites.push(suite_1);
                }
                return suites;
            }
            stub.per =
                function (params) {
                    var paramLists = multiplyParams(params, baseParamLists);
                    var describe = createParameterizedSuiteFunction(paramLists, brand, adapter);
                    return describe;
                };
            stub.when =
                function (condition) {
                    return condition ? describe : skip(brand);
                };
            var describe = makeParameterizableFunction(stub, function () {
                return skip(Brand.SKIP_OR_ONLY);
            }, function () {
                return createParameterizedSuiteFunction(onlyAll(baseParamLists), Brand.SKIP_OR_ONLY, adapter);
            }, brand);
            return describe;
        }
        function createParameterizedTestFunction(baseParamLists, brand, adapter) {
            function skip(brand) {
                var it = createParameterizedTestFunction(skipAll(baseParamLists), brand, adapter);
                return it;
            }
            function stub(titlePattern, fn) {
                var adaptParams = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    adaptParams[_i - 2] = arguments[_i];
                }
                validateTitlePattern(titlePattern);
                var paramCount = baseParamLists[0].length;
                validateTestCallback(fn, paramCount);
                var titleFormatter = new TitleFormatter(titlePattern, paramCount);
                var tests = new SpecItemArray();
                for (var _a = 0, baseParamLists_2 = baseParamLists; _a < baseParamLists_2.length; _a++) {
                    var paramList = baseParamLists_2[_a];
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
                    tests.parent = test_1.parent;
                    if (adapter)
                        adapter.apply(test_1, adaptParams);
                    tests.push(test_1);
                }
                return tests;
            }
            stub.per =
                function (params) {
                    var paramLists = multiplyParams(params, baseParamLists);
                    var it = createParameterizedTestFunction(paramLists, brand, adapter);
                    return it;
                };
            stub.when =
                function (condition) {
                    return condition ? it : skip(brand);
                };
            var it = makeParameterizableFunction(stub, function () {
                return skip(Brand.SKIP_OR_ONLY);
            }, function () {
                return createParameterizedTestFunction(onlyAll(baseParamLists), Brand.SKIP_OR_ONLY, adapter);
            }, brand);
            return it;
        }
        function createUnparameterizedSuiteFunction(baseMode, brand, adapter) {
            if (baseMode === void 0) { baseMode = Mode.NORMAL; }
            if (brand === void 0) { brand = Brand.NONE; }
            function stub(title, fn) {
                var adaptParams = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    adaptParams[_i - 2] = arguments[_i];
                }
                validateTitle(title);
                validateSuiteCallback(fn, 0);
                var createSuite = getCreateSuite(baseMode);
                var suite = createSuite(title, fn);
                if (adapter)
                    adapter.apply(suite, adaptParams);
                return suite;
            }
            stub.per =
                function (params) {
                    var paramLists = createParamLists(params, baseMode);
                    var describe = createParameterizedSuiteFunction(paramLists, brand, adapter);
                    return describe;
                };
            stub.when =
                function (condition) {
                    return condition ? describe : createUnparameterizedSuiteFunction(Mode.SKIP, brand, adapter);
                };
            var describe = makeParameterizableFunction(stub, function () {
                return createUnparameterizedSuiteFunction(Mode.SKIP, Brand.SKIP_OR_ONLY, adapter);
            }, function () {
                return createUnparameterizedSuiteFunction(maxMode(Mode.ONLY, baseMode), Brand.SKIP_OR_ONLY, adapter);
            }, brand);
            return describe;
        }
        function createUnparameterizedTestFunction(baseMode, brand, adapter) {
            if (baseMode === void 0) { baseMode = Mode.NORMAL; }
            if (brand === void 0) { brand = Brand.NONE; }
            function stub(title, fn) {
                var adaptParams = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    adaptParams[_i - 2] = arguments[_i];
                }
                validateTitle(title);
                validateTestCallback(fn, 0);
                var createTest = getCreateTest(baseMode);
                var test = createTest(title, fn);
                if (adapter)
                    adapter.apply(test, adaptParams);
                return test;
            }
            stub.per =
                function (params) {
                    var paramLists = createParamLists(params, baseMode);
                    var it = createParameterizedTestFunction(paramLists, brand, adapter);
                    return it;
                };
            stub.when =
                function (condition) {
                    return condition ? it : createUnparameterizedTestFunction(Mode.SKIP, brand, adapter);
                };
            var it = makeParameterizableFunction(stub, function () {
                return createUnparameterizedTestFunction(Mode.SKIP, Brand.SKIP_OR_ONLY, adapter);
            }, function () {
                return createUnparameterizedTestFunction(maxMode(Mode.ONLY, baseMode), Brand.SKIP_OR_ONLY, adapter);
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
        createBDDInterface.call(this, context, file, mocha);
        var bddDescribe = context.describe, bddIt = context.it;
        var bddXit = function (title) { return bddIt(title); };
        context.describe = context.context =
            createAdaptableSuiteFunction();
        context.xdescribe = context.xcontext =
            createUnparameterizedSuiteFunction(Mode.SKIP, Brand.XDESCRIBE);
        context.it = context.specify =
            createAdaptableTestFunction();
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
                var paramList;
                var mode;
                if (paramOrParamInfo instanceof ParamInfo) {
                    paramList = [paramOrParamInfo.param];
                    var paramInfoMode = paramOrParamInfo.mode;
                    if (typeof paramInfoMode !== 'number' || !(paramInfoMode in Mode)) {
                        var message_1 = 'Invalid parameter.';
                        throw TypeError(message_1);
                    }
                    mode = maxMode(paramInfoMode, baseMode);
                }
                else {
                    paramList = [paramOrParamInfo];
                    mode = baseMode;
                }
                makeParamList(paramList, mode);
                return paramList;
            });
            if (paramLists.length)
                return paramLists;
        }
        var message = 'Argument is not a nonempty array-like object.';
        throw TypeError(message);
    }
    function ebdd(suite) {
        suite.on('pre-require', createEBDDInterface);
    }
    function makeParamList(paramList, mode) {
        paramList.mode = mode;
    }
    function makeParameterizableFunction(stub, skip, only, brand) {
        switch (brand) {
            case Brand.NONE:
                break;
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
                var paramList = __spreadArrays$1(baseParamList, newParamList);
                var mode = maxMode(newParamList.mode, baseMode);
                makeParamList(paramList, mode);
                paramLists.push(paramList);
            }
        }
        return paramLists;
    }
    function onlyAll(baseParamLists) {
        var paramLists = baseParamLists.map(function (baseParamList) {
            var paramList = __spreadArrays$1(baseParamList);
            var mode = maxMode(Mode.ONLY, baseParamList.mode);
            makeParamList(paramList, mode);
            return paramList;
        });
        return paramLists;
    }
    function skipAll(baseParamLists) {
        var paramLists = baseParamLists.map(function (baseParamList) {
            var paramList = __spreadArrays$1(baseParamList);
            makeParamList(paramList, Mode.SKIP);
            return paramList;
        });
        return paramLists;
    }
    function validateAdapter(adapter) {
        if (typeof adapter !== 'function') {
            var message = 'Argument `adapter` is not a function.';
            throw TypeError(message);
        }
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

    function isArrayBased(array) {
        if (!(array instanceof Array))
            return false;
        var length = array.length;
        array.push(null);
        if (array.length !== length + 1)
            return false;
        array.pop();
        if (array.length !== length)
            return false;
        return true;
    }
    function loadEBDD() {
        var context = {};
        Mocha.interfaces.ebdd = ebdd;
        try {
            var mocha_1 = new Mocha__default({ ui: 'ebdd' });
            mocha_1.suite.emit('pre-require', context, '', mocha_1);
        }
        finally {
            delete Mocha.interfaces.ebdd;
        }
        return context;
    }

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
    var inited = false;
    function init () {
      inited = true;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;
    }

    function toByteArray (b64) {
      if (!inited) {
        init();
      }
      var i, j, l, tmp, placeHolders, arr;
      var len = b64.length;

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

      // base64 is 4/3 + up to two characters of the original data
      arr = new Arr(len * 3 / 4 - placeHolders);

      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len;

      var L = 0;

      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
        arr[L++] = (tmp >> 16) & 0xFF;
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      if (placeHolders === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
        arr[L++] = tmp & 0xFF;
      } else if (placeHolders === 1) {
        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      return arr
    }

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }

    function encodeChunk (uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join('')
    }

    function fromByteArray (uint8) {
      if (!inited) {
        init();
      }
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
      var output = '';
      var parts = [];
      var maxChunkLength = 16383; // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup[tmp >> 2];
        output += lookup[(tmp << 4) & 0x3F];
        output += '==';
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
        output += lookup[tmp >> 10];
        output += lookup[(tmp >> 4) & 0x3F];
        output += lookup[(tmp << 2) & 0x3F];
        output += '=';
      }

      parts.push(output);

      return parts.join('')
    }

    function read (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? (nBytes - 1) : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }

    function write (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
      var i = isLE ? 0 : (nBytes - 1);
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    }

    var toString = {}.toString;

    var isArray = Array.isArray || function (arr) {
      return toString.call(arr) == '[object Array]';
    };

    var INSPECT_MAX_BYTES = 50;

    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Use Object implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * Due to various browser bugs, sometimes the Object implementation will be used even
     * when the browser supports typed arrays.
     *
     * Note:
     *
     *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
     *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
     *
     *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
     *
     *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
     *     incorrect length in some situations.

     * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
     * get the Object implementation, which is slower but behaves correctly.
     */
    Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
      ? global$1.TYPED_ARRAY_SUPPORT
      : true;

    function kMaxLength () {
      return Buffer.TYPED_ARRAY_SUPPORT
        ? 0x7fffffff
        : 0x3fffffff
    }

    function createBuffer (that, length) {
      if (kMaxLength() < length) {
        throw new RangeError('Invalid typed array length')
      }
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = new Uint8Array(length);
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        if (that === null) {
          that = new Buffer(length);
        }
        that.length = length;
      }

      return that
    }

    /**
     * The Buffer constructor returns instances of `Uint8Array` that have their
     * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
     * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
     * and the `Uint8Array` methods. Square bracket notation works as expected -- it
     * returns a single octet.
     *
     * The `Uint8Array` prototype remains unmodified.
     */

    function Buffer (arg, encodingOrOffset, length) {
      if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
        return new Buffer(arg, encodingOrOffset, length)
      }

      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new Error(
            'If encoding is specified then the first argument must be a string'
          )
        }
        return allocUnsafe(this, arg)
      }
      return from(this, arg, encodingOrOffset, length)
    }

    Buffer.poolSize = 8192; // not used by this implementation

    // TODO: Legacy, not needed anymore. Remove in next major version.
    Buffer._augment = function (arr) {
      arr.__proto__ = Buffer.prototype;
      return arr
    };

    function from (that, value, encodingOrOffset, length) {
      if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number')
      }

      if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
        return fromArrayBuffer(that, value, encodingOrOffset, length)
      }

      if (typeof value === 'string') {
        return fromString(that, value, encodingOrOffset)
      }

      return fromObject(that, value)
    }

    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer.from = function (value, encodingOrOffset, length) {
      return from(null, value, encodingOrOffset, length)
    };

    if (Buffer.TYPED_ARRAY_SUPPORT) {
      Buffer.prototype.__proto__ = Uint8Array.prototype;
      Buffer.__proto__ = Uint8Array;
    }

    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be a number')
      } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative')
      }
    }

    function alloc (that, size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(that, size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string'
          ? createBuffer(that, size).fill(fill, encoding)
          : createBuffer(that, size).fill(fill)
      }
      return createBuffer(that, size)
    }

    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer.alloc = function (size, fill, encoding) {
      return alloc(null, size, fill, encoding)
    };

    function allocUnsafe (that, size) {
      assertSize(size);
      that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < size; ++i) {
          that[i] = 0;
        }
      }
      return that
    }

    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(null, size)
    };
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(null, size)
    };

    function fromString (that, string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
      }

      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding')
      }

      var length = byteLength(string, encoding) | 0;
      that = createBuffer(that, length);

      var actual = that.write(string, encoding);

      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        that = that.slice(0, actual);
      }

      return that
    }

    function fromArrayLike (that, array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      that = createBuffer(that, length);
      for (var i = 0; i < length; i += 1) {
        that[i] = array[i] & 255;
      }
      return that
    }

    function fromArrayBuffer (that, array, byteOffset, length) {
      array.byteLength; // this throws if `array` is not a valid ArrayBuffer

      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('\'offset\' is out of bounds')
      }

      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('\'length\' is out of bounds')
      }

      if (byteOffset === undefined && length === undefined) {
        array = new Uint8Array(array);
      } else if (length === undefined) {
        array = new Uint8Array(array, byteOffset);
      } else {
        array = new Uint8Array(array, byteOffset, length);
      }

      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = array;
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        that = fromArrayLike(that, array);
      }
      return that
    }

    function fromObject (that, obj) {
      if (internalIsBuffer(obj)) {
        var len = checked(obj.length) | 0;
        that = createBuffer(that, len);

        if (that.length === 0) {
          return that
        }

        obj.copy(that, 0, 0, len);
        return that
      }

      if (obj) {
        if ((typeof ArrayBuffer !== 'undefined' &&
            obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
          if (typeof obj.length !== 'number' || isnan(obj.length)) {
            return createBuffer(that, 0)
          }
          return fromArrayLike(that, obj)
        }

        if (obj.type === 'Buffer' && isArray(obj.data)) {
          return fromArrayLike(that, obj.data)
        }
      }

      throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
    }

    function checked (length) {
      // Note: cannot use `length < kMaxLength()` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= kMaxLength()) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                             'size: 0x' + kMaxLength().toString(16) + ' bytes')
      }
      return length | 0
    }
    Buffer.isBuffer = isBuffer;
    function internalIsBuffer (b) {
      return !!(b != null && b._isBuffer)
    }

    Buffer.compare = function compare (a, b) {
      if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
        throw new TypeError('Arguments must be Buffers')
      }

      if (a === b) return 0

      var x = a.length;
      var y = b.length;

      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    Buffer.isEncoding = function isEncoding (encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    };

    Buffer.concat = function concat (list, length) {
      if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }

      if (list.length === 0) {
        return Buffer.alloc(0)
      }

      var i;
      if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }

      var buffer = Buffer.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (!internalIsBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer
    };

    function byteLength (string, encoding) {
      if (internalIsBuffer(string)) {
        return string.length
      }
      if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
          (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        string = '' + string;
      }

      var len = string.length;
      if (len === 0) return 0

      // Use a for loop to avoid recursion
      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
          case undefined:
            return utf8ToBytes(string).length
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2
          case 'hex':
            return len >>> 1
          case 'base64':
            return base64ToBytes(string).length
          default:
            if (loweredCase) return utf8ToBytes(string).length // assume utf8
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer.byteLength = byteLength;

    function slowToString (encoding, start, end) {
      var loweredCase = false;

      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.

      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0;
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }

      if (end === undefined || end > this.length) {
        end = this.length;
      }

      if (end <= 0) {
        return ''
      }

      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0;
      start >>>= 0;

      if (end <= start) {
        return ''
      }

      if (!encoding) encoding = 'utf8';

      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)

          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)

          case 'ascii':
            return asciiSlice(this, start, end)

          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end)

          case 'base64':
            return base64Slice(this, start, end)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
        }
      }
    }

    // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
    // Buffer instances.
    Buffer.prototype._isBuffer = true;

    function swap (b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }

    Buffer.prototype.swap16 = function swap16 () {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this
    };

    Buffer.prototype.swap32 = function swap32 () {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this
    };

    Buffer.prototype.swap64 = function swap64 () {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this
    };

    Buffer.prototype.toString = function toString () {
      var length = this.length | 0;
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    };

    Buffer.prototype.equals = function equals (b) {
      if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    };

    Buffer.prototype.inspect = function inspect () {
      var str = '';
      var max = INSPECT_MAX_BYTES;
      if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
        if (this.length > max) str += ' ... ';
      }
      return '<Buffer ' + str + '>'
    };

    Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (!internalIsBuffer(target)) {
        throw new TypeError('Argument must be a Buffer')
      }

      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = target ? target.length : 0;
      }
      if (thisStart === undefined) {
        thisStart = 0;
      }
      if (thisEnd === undefined) {
        thisEnd = this.length;
      }

      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index')
      }

      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }

      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;

      if (this === target) return 0

      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);

      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);

      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
    // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
    //
    // Arguments:
    // - buffer - a Buffer to search
    // - val - a string, Buffer, or number
    // - byteOffset - an index into `buffer`; will be clamped to an int32
    // - encoding - an optional encoding, relevant is val is a string
    // - dir - true for indexOf, false for lastIndexOf
    function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
      if (buffer.length === 0) return -1

      // Normalize byteOffset
      if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff;
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000;
      }
      byteOffset = +byteOffset;  // Coerce to Number.
      if (isNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1);
      }

      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1
      }

      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding);
      }

      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (internalIsBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF; // Search for a byte value [0-255]
        if (Buffer.TYPED_ARRAY_SUPPORT &&
            typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
      }

      throw new TypeError('val must be string, number or Buffer')
    }

    function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;

      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }

      function read (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }

      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break
            }
          }
          if (found) return i
        }
      }

      return -1
    }

    Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    };

    Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    };

    Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    };

    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }

      // must be an even number of digits
      var strLen = string.length;
      if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (isNaN(parsed)) return i
        buf[offset + i] = parsed;
      }
      return i
    }

    function utf8Write (buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }

    function asciiWrite (buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }

    function latin1Write (buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }

    function base64Write (buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }

    function ucs2Write (buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
    }

    Buffer.prototype.write = function write (string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset | 0;
        if (isFinite(length)) {
          length = length | 0;
          if (encoding === undefined) encoding = 'utf8';
        } else {
          encoding = length;
          length = undefined;
        }
      // legacy write(string, encoding, offset, length) - remove in v0.13
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }

      var remaining = this.length - offset;
      if (length === undefined || length > remaining) length = remaining;

      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }

      if (!encoding) encoding = 'utf8';

      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)

          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)

          case 'ascii':
            return asciiWrite(this, string, offset, length)

          case 'latin1':
          case 'binary':
            return latin1Write(this, string, offset, length)

          case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };

    Buffer.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    };

    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return fromByteArray(buf)
      } else {
        return fromByteArray(buf.slice(start, end))
      }
    }

    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];

      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
          : 1;

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte;
              }
              break
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }

        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD;
          bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000;
          res.push(codePoint >>> 10 & 0x3FF | 0xD800);
          codePoint = 0xDC00 | codePoint & 0x3FF;
        }

        res.push(codePoint);
        i += bytesPerSequence;
      }

      return decodeCodePointsArray(res)
    }

    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000;

    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }

      // Decode in chunks to avoid "call stack size exceeded".
      var res = '';
      var i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res
    }

    function asciiSlice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F);
      }
      return ret
    }

    function latin1Slice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret
    }

    function hexSlice (buf, start, end) {
      var len = buf.length;

      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;

      var out = '';
      for (var i = start; i < end; ++i) {
        out += toHex(buf[i]);
      }
      return out
    }

    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = '';
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res
    }

    Buffer.prototype.slice = function slice (start, end) {
      var len = this.length;
      start = ~~start;
      end = end === undefined ? len : ~~end;

      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }

      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }

      if (end < start) end = start;

      var newBuf;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end);
        newBuf.__proto__ = Buffer.prototype;
      } else {
        var sliceLen = end - start;
        newBuf = new Buffer(sliceLen, undefined);
        for (var i = 0; i < sliceLen; ++i) {
          newBuf[i] = this[i + start];
        }
      }

      return newBuf
    };

    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }

    Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }

      return val
    };

    Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
      }

      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul;
      }

      return val
    };

    Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset]
    };

    Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | (this[offset + 1] << 8)
    };

    Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return (this[offset] << 8) | this[offset + 1]
    };

    Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    };

    Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    };

    Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var i = byteLength;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    };

    Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | (this[offset + 1] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | (this[offset] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    };

    Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    };

    Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, true, 23, 4)
    };

    Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, false, 23, 4)
    };

    Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, true, 52, 8)
    };

    Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, false, 52, 8)
    };

    function checkInt (buf, value, offset, ext, max, min) {
      if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }

    Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var mul = 1;
      var i = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var i = byteLength - 1;
      var mul = 1;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      this[offset] = (value & 0xff);
      return offset + 1
    };

    function objectWriteUInt16 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
          (littleEndian ? i : 1 - i) * 8;
      }
    }

    Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    function objectWriteUInt32 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffffffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
      }
    }

    Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = (value >>> 24);
        this[offset + 2] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = byteLength - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      if (value < 0) value = 0xff + value + 1;
      this[offset] = (value & 0xff);
      return offset + 1
    };

    Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = (value >>> 16);
        this[offset + 3] = (value >>> 24);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (value < 0) value = 0xffffffff + value + 1;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }

    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4);
      }
      write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4
    }

    Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    };

    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8);
      }
      write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8
    }

    Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    };

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy (target, targetStart, start, end) {
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;

      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0

      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')

      // Are we oob?
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }

      var len = end - start;
      var i;

      if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start];
        }
      } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
        // ascending copy from start
        for (i = 0; i < len; ++i) {
          target[i + targetStart] = this[i + start];
        }
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, start + len),
          targetStart
        );
      }

      return len
    };

    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === 'string') {
          encoding = end;
          end = this.length;
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (code < 256) {
            val = code;
          }
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
      } else if (typeof val === 'number') {
        val = val & 255;
      }

      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }

      if (end <= start) {
        return this
      }

      start = start >>> 0;
      end = end === undefined ? this.length : end >>> 0;

      if (!val) val = 0;

      var i;
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = internalIsBuffer(val)
          ? val
          : utf8ToBytes(new Buffer(val, encoding).toString());
        var len = bytes.length;
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }

      return this
    };

    // HELPER FUNCTIONS
    // ================

    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

    function base64clean (str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = stringtrim(str).replace(INVALID_BASE64_RE, '');
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '=';
      }
      return str
    }

    function stringtrim (str) {
      if (str.trim) return str.trim()
      return str.replace(/^\s+|\s+$/g, '')
    }

    function toHex (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }

    function utf8ToBytes (string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];

      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            }

            // valid lead
            leadSurrogate = codePoint;

            continue
          }

          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            leadSurrogate = codePoint;
            continue
          }

          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint);
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else {
          throw new Error('Invalid code point')
        }
      }

      return bytes
    }

    function asciiToBytes (str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF);
      }
      return byteArray
    }

    function utf16leToBytes (str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break

        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }

      return byteArray
    }


    function base64ToBytes (str) {
      return toByteArray(base64clean(str))
    }

    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i];
      }
      return i
    }

    function isnan (val) {
      return val !== val // eslint-disable-line no-self-compare
    }


    // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
    // The _isBuffer check is for Safari 5-7 support, because it's missing
    // Object.prototype.constructor. Remove this eventually
    function isBuffer(obj) {
      return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
    }

    function isFastBuffer (obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    }

    // For Node v0.10 support. Remove this eventually.
    function isSlowBuffer (obj) {
      return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
    }

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    var inherits;
    if (typeof Object.create === 'function'){
      inherits = function inherits(ctor, superCtor) {
        // implementation from standard node.js 'util' module
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      };
    } else {
      inherits = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function () {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      };
    }
    var inherits$1 = inherits;

    /**
     * Echos the value of a value. Trys to print the value out
     * in the best way possible given the different types.
     *
     * @param {Object} obj The object to print out.
     * @param {Object} opts Optional options object that alters the output.
     */
    /* legacy: obj, showHidden, depth, colors*/
    function inspect(obj, opts) {
      // default options
      var ctx = {
        seen: [],
        stylize: stylizeNoColor
      };
      // legacy...
      if (arguments.length >= 3) ctx.depth = arguments[2];
      if (arguments.length >= 4) ctx.colors = arguments[3];
      if (isBoolean(opts)) {
        // legacy...
        ctx.showHidden = opts;
      } else if (opts) {
        // got an "options" object
        _extend(ctx, opts);
      }
      // set default options
      if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
      if (isUndefined(ctx.depth)) ctx.depth = 2;
      if (isUndefined(ctx.colors)) ctx.colors = false;
      if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
      if (ctx.colors) ctx.stylize = stylizeWithColor;
      return formatValue(ctx, obj, ctx.depth);
    }

    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    inspect.colors = {
      'bold' : [1, 22],
      'italic' : [3, 23],
      'underline' : [4, 24],
      'inverse' : [7, 27],
      'white' : [37, 39],
      'grey' : [90, 39],
      'black' : [30, 39],
      'blue' : [34, 39],
      'cyan' : [36, 39],
      'green' : [32, 39],
      'magenta' : [35, 39],
      'red' : [31, 39],
      'yellow' : [33, 39]
    };

    // Don't use 'blue' not visible on cmd.exe
    inspect.styles = {
      'special': 'cyan',
      'number': 'yellow',
      'boolean': 'yellow',
      'undefined': 'grey',
      'null': 'bold',
      'string': 'green',
      'date': 'magenta',
      // "name": intentionally not styling
      'regexp': 'red'
    };


    function stylizeWithColor(str, styleType) {
      var style = inspect.styles[styleType];

      if (style) {
        return '\u001b[' + inspect.colors[style][0] + 'm' + str +
               '\u001b[' + inspect.colors[style][1] + 'm';
      } else {
        return str;
      }
    }


    function stylizeNoColor(str, styleType) {
      return str;
    }


    function arrayToHash(array) {
      var hash = {};

      array.forEach(function(val, idx) {
        hash[val] = true;
      });

      return hash;
    }


    function formatValue(ctx, value, recurseTimes) {
      // Provide a hook for user-specified inspect functions.
      // Check that value is an object with an inspect function on it
      if (ctx.customInspect &&
          value &&
          isFunction(value.inspect) &&
          // Filter out the util module, it's inspect function is special
          value.inspect !== inspect &&
          // Also filter out any prototype objects using the circular check.
          !(value.constructor && value.constructor.prototype === value)) {
        var ret = value.inspect(recurseTimes, ctx);
        if (!isString(ret)) {
          ret = formatValue(ctx, ret, recurseTimes);
        }
        return ret;
      }

      // Primitive types cannot have properties
      var primitive = formatPrimitive(ctx, value);
      if (primitive) {
        return primitive;
      }

      // Look up the keys of the object.
      var keys = Object.keys(value);
      var visibleKeys = arrayToHash(keys);

      if (ctx.showHidden) {
        keys = Object.getOwnPropertyNames(value);
      }

      // IE doesn't make error fields non-enumerable
      // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
      if (isError(value)
          && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
        return formatError(value);
      }

      // Some type of object without properties can be shortcutted.
      if (keys.length === 0) {
        if (isFunction(value)) {
          var name = value.name ? ': ' + value.name : '';
          return ctx.stylize('[Function' + name + ']', 'special');
        }
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
        }
        if (isDate(value)) {
          return ctx.stylize(Date.prototype.toString.call(value), 'date');
        }
        if (isError(value)) {
          return formatError(value);
        }
      }

      var base = '', array = false, braces = ['{', '}'];

      // Make Array say that they are Array
      if (isArray$1(value)) {
        array = true;
        braces = ['[', ']'];
      }

      // Make functions say that they are functions
      if (isFunction(value)) {
        var n = value.name ? ': ' + value.name : '';
        base = ' [Function' + n + ']';
      }

      // Make RegExps say that they are RegExps
      if (isRegExp(value)) {
        base = ' ' + RegExp.prototype.toString.call(value);
      }

      // Make dates with properties first say the date
      if (isDate(value)) {
        base = ' ' + Date.prototype.toUTCString.call(value);
      }

      // Make error with message first say the error
      if (isError(value)) {
        base = ' ' + formatError(value);
      }

      if (keys.length === 0 && (!array || value.length == 0)) {
        return braces[0] + base + braces[1];
      }

      if (recurseTimes < 0) {
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
        } else {
          return ctx.stylize('[Object]', 'special');
        }
      }

      ctx.seen.push(value);

      var output;
      if (array) {
        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
      } else {
        output = keys.map(function(key) {
          return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
        });
      }

      ctx.seen.pop();

      return reduceToSingleString(output, base, braces);
    }


    function formatPrimitive(ctx, value) {
      if (isUndefined(value))
        return ctx.stylize('undefined', 'undefined');
      if (isString(value)) {
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return ctx.stylize(simple, 'string');
      }
      if (isNumber(value))
        return ctx.stylize('' + value, 'number');
      if (isBoolean(value))
        return ctx.stylize('' + value, 'boolean');
      // For some reason typeof null is "object", so special case here.
      if (isNull(value))
        return ctx.stylize('null', 'null');
    }


    function formatError(value) {
      return '[' + Error.prototype.toString.call(value) + ']';
    }


    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
      var output = [];
      for (var i = 0, l = value.length; i < l; ++i) {
        if (hasOwnProperty(value, String(i))) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              String(i), true));
        } else {
          output.push('');
        }
      }
      keys.forEach(function(key) {
        if (!key.match(/^\d+$/)) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              key, true));
        }
      });
      return output;
    }


    function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
      var name, str, desc;
      desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
      if (desc.get) {
        if (desc.set) {
          str = ctx.stylize('[Getter/Setter]', 'special');
        } else {
          str = ctx.stylize('[Getter]', 'special');
        }
      } else {
        if (desc.set) {
          str = ctx.stylize('[Setter]', 'special');
        }
      }
      if (!hasOwnProperty(visibleKeys, key)) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (ctx.seen.indexOf(desc.value) < 0) {
          if (isNull(recurseTimes)) {
            str = formatValue(ctx, desc.value, null);
          } else {
            str = formatValue(ctx, desc.value, recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (array) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = ctx.stylize('[Circular]', 'special');
        }
      }
      if (isUndefined(name)) {
        if (array && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = ctx.stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = ctx.stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    }


    function reduceToSingleString(output, base, braces) {
      var length = output.reduce(function(prev, cur) {
        if (cur.indexOf('\n') >= 0) ;
        return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
      }, 0);

      if (length > 60) {
        return braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];
      }

      return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }


    // NOTE: These type checking functions intentionally don't use `instanceof`
    // because it is fragile and can be easily faked with `Object.create()`.
    function isArray$1(ar) {
      return Array.isArray(ar);
    }

    function isBoolean(arg) {
      return typeof arg === 'boolean';
    }

    function isNull(arg) {
      return arg === null;
    }

    function isNumber(arg) {
      return typeof arg === 'number';
    }

    function isString(arg) {
      return typeof arg === 'string';
    }

    function isUndefined(arg) {
      return arg === void 0;
    }

    function isRegExp(re) {
      return isObject(re) && objectToString(re) === '[object RegExp]';
    }

    function isObject(arg) {
      return typeof arg === 'object' && arg !== null;
    }

    function isDate(d) {
      return isObject(d) && objectToString(d) === '[object Date]';
    }

    function isError(e) {
      return isObject(e) &&
          (objectToString(e) === '[object Error]' || e instanceof Error);
    }

    function isFunction(arg) {
      return typeof arg === 'function';
    }

    function isPrimitive(arg) {
      return arg === null ||
             typeof arg === 'boolean' ||
             typeof arg === 'number' ||
             typeof arg === 'string' ||
             typeof arg === 'symbol' ||  // ES6 symbol
             typeof arg === 'undefined';
    }

    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }

    function _extend(origin, add) {
      // Don't do anything if add isn't an object
      if (!add || !isObject(add)) return origin;

      var keys = Object.keys(add);
      var i = keys.length;
      while (i--) {
        origin[keys[i]] = add[keys[i]];
      }
      return origin;
    }
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    function compare(a, b) {
      if (a === b) {
        return 0;
      }

      var x = a.length;
      var y = b.length;

      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }

      if (x < y) {
        return -1;
      }
      if (y < x) {
        return 1;
      }
      return 0;
    }
    var hasOwn = Object.prototype.hasOwnProperty;

    var objectKeys = Object.keys || function (obj) {
      var keys = [];
      for (var key in obj) {
        if (hasOwn.call(obj, key)) keys.push(key);
      }
      return keys;
    };
    var pSlice = Array.prototype.slice;
    var _functionsHaveNames;
    function functionsHaveNames() {
      if (typeof _functionsHaveNames !== 'undefined') {
        return _functionsHaveNames;
      }
      return _functionsHaveNames = (function () {
        return function foo() {}.name === 'foo';
      }());
    }
    function pToString (obj) {
      return Object.prototype.toString.call(obj);
    }
    function isView(arrbuf) {
      if (isBuffer(arrbuf)) {
        return false;
      }
      if (typeof global$1.ArrayBuffer !== 'function') {
        return false;
      }
      if (typeof ArrayBuffer.isView === 'function') {
        return ArrayBuffer.isView(arrbuf);
      }
      if (!arrbuf) {
        return false;
      }
      if (arrbuf instanceof DataView) {
        return true;
      }
      if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
        return true;
      }
      return false;
    }

    // 2. The AssertionError is defined in assert.
    // new assert.AssertionError({ message: message,
    //                             actual: actual,
    //                             expected: expected })

    var regex = /\s*function\s+([^\(\s]*)\s*/;
    // based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
    function getName(func) {
      if (!isFunction(func)) {
        return;
      }
      if (functionsHaveNames()) {
        return func.name;
      }
      var str = func.toString();
      var match = str.match(regex);
      return match && match[1];
    }
    function AssertionError(options) {
      this.name = 'AssertionError';
      this.actual = options.actual;
      this.expected = options.expected;
      this.operator = options.operator;
      if (options.message) {
        this.message = options.message;
        this.generatedMessage = false;
      } else {
        this.message = getMessage(this);
        this.generatedMessage = true;
      }
      var stackStartFunction = options.stackStartFunction || fail;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, stackStartFunction);
      } else {
        // non v8 browsers so we can have a stacktrace
        var err = new Error();
        if (err.stack) {
          var out = err.stack;

          // try to strip useless frames
          var fn_name = getName(stackStartFunction);
          var idx = out.indexOf('\n' + fn_name);
          if (idx >= 0) {
            // once we have located the function frame
            // we need to strip out everything before it (and its line)
            var next_line = out.indexOf('\n', idx + 1);
            out = out.substring(next_line + 1);
          }

          this.stack = out;
        }
      }
    }

    // assert.AssertionError instanceof Error
    inherits$1(AssertionError, Error);

    function truncate(s, n) {
      if (typeof s === 'string') {
        return s.length < n ? s : s.slice(0, n);
      } else {
        return s;
      }
    }
    function inspect$1(something) {
      if (functionsHaveNames() || !isFunction(something)) {
        return inspect(something);
      }
      var rawname = getName(something);
      var name = rawname ? ': ' + rawname : '';
      return '[Function' +  name + ']';
    }
    function getMessage(self) {
      return truncate(inspect$1(self.actual), 128) + ' ' +
             self.operator + ' ' +
             truncate(inspect$1(self.expected), 128);
    }

    // At present only the three keys mentioned above are used and
    // understood by the spec. Implementations or sub modules can pass
    // other keys to the AssertionError's constructor - they will be
    // ignored.

    // 3. All of the following functions must throw an AssertionError
    // when a corresponding condition is not met, with a message that
    // may be undefined if not provided.  All assertion methods provide
    // both the actual and expected values to the assertion error for
    // display purposes.

    function fail(actual, expected, message, operator, stackStartFunction) {
      throw new AssertionError({
        message: message,
        actual: actual,
        expected: expected,
        operator: operator,
        stackStartFunction: stackStartFunction
      });
    }

    // 4. Pure assertion tests whether a value is truthy, as determined
    // by !!guard.
    // assert.ok(guard, message_opt);
    // This statement is equivalent to assert.equal(true, !!guard,
    // message_opt);. To test strictly for the value true, use
    // assert.strictEqual(true, guard, message_opt);.

    function ok(value, message) {
      if (!value) fail(value, true, message, '==', ok);
    }
    function deepStrictEqual(actual, expected, message) {
      if (!_deepEqual(actual, expected, true)) {
        fail(actual, expected, message, 'deepStrictEqual', deepStrictEqual);
      }
    }

    function _deepEqual(actual, expected, strict, memos) {
      // 7.1. All identical values are equivalent, as determined by ===.
      if (actual === expected) {
        return true;
      } else if (isBuffer(actual) && isBuffer(expected)) {
        return compare(actual, expected) === 0;

      // 7.2. If the expected value is a Date object, the actual value is
      // equivalent if it is also a Date object that refers to the same time.
      } else if (isDate(actual) && isDate(expected)) {
        return actual.getTime() === expected.getTime();

      // 7.3 If the expected value is a RegExp object, the actual value is
      // equivalent if it is also a RegExp object with the same source and
      // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
      } else if (isRegExp(actual) && isRegExp(expected)) {
        return actual.source === expected.source &&
               actual.global === expected.global &&
               actual.multiline === expected.multiline &&
               actual.lastIndex === expected.lastIndex &&
               actual.ignoreCase === expected.ignoreCase;

      // 7.4. Other pairs that do not both pass typeof value == 'object',
      // equivalence is determined by ==.
      } else if ((actual === null || typeof actual !== 'object') &&
                 (expected === null || typeof expected !== 'object')) {
        return strict ? actual === expected : actual == expected;

      // If both values are instances of typed arrays, wrap their underlying
      // ArrayBuffers in a Buffer each to increase performance
      // This optimization requires the arrays to have the same type as checked by
      // Object.prototype.toString (aka pToString). Never perform binary
      // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
      // bit patterns are not identical.
      } else if (isView(actual) && isView(expected) &&
                 pToString(actual) === pToString(expected) &&
                 !(actual instanceof Float32Array ||
                   actual instanceof Float64Array)) {
        return compare(new Uint8Array(actual.buffer),
                       new Uint8Array(expected.buffer)) === 0;

      // 7.5 For all other Object pairs, including Array objects, equivalence is
      // determined by having the same number of owned properties (as verified
      // with Object.prototype.hasOwnProperty.call), the same set of keys
      // (although not necessarily the same order), equivalent values for every
      // corresponding key, and an identical 'prototype' property. Note: this
      // accounts for both named and indexed properties on Arrays.
      } else if (isBuffer(actual) !== isBuffer(expected)) {
        return false;
      } else {
        memos = memos || {actual: [], expected: []};

        var actualIndex = memos.actual.indexOf(actual);
        if (actualIndex !== -1) {
          if (actualIndex === memos.expected.indexOf(expected)) {
            return true;
          }
        }

        memos.actual.push(actual);
        memos.expected.push(expected);

        return objEquiv(actual, expected, strict, memos);
      }
    }

    function isArguments(object) {
      return Object.prototype.toString.call(object) == '[object Arguments]';
    }

    function objEquiv(a, b, strict, actualVisitedObjects) {
      if (a === null || a === undefined || b === null || b === undefined)
        return false;
      // if one is a primitive, the other must be same
      if (isPrimitive(a) || isPrimitive(b))
        return a === b;
      if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
        return false;
      var aIsArgs = isArguments(a);
      var bIsArgs = isArguments(b);
      if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
        return false;
      if (aIsArgs) {
        a = pSlice.call(a);
        b = pSlice.call(b);
        return _deepEqual(a, b, strict);
      }
      var ka = objectKeys(a);
      var kb = objectKeys(b);
      var key, i;
      // having the same number of owned properties (keys incorporates
      // hasOwnProperty)
      if (ka.length !== kb.length)
        return false;
      //the same set of keys (although not necessarily the same order),
      ka.sort();
      kb.sort();
      //~~~cheap key test
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] !== kb[i])
          return false;
      }
      //equivalent values for every corresponding key, and
      //~~~possibly expensive deep test
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
          return false;
      }
      return true;
    }
    function strictEqual(actual, expected, message) {
      if (actual !== expected) {
        fail(actual, expected, message, '===', strictEqual);
      }
    }

    function expectedException(actual, expected) {
      if (!actual || !expected) {
        return false;
      }

      if (Object.prototype.toString.call(expected) == '[object RegExp]') {
        return expected.test(actual);
      }

      try {
        if (actual instanceof expected) {
          return true;
        }
      } catch (e) {
        // Ignore.  The instanceof check doesn't work for arrow functions.
      }

      if (Error.isPrototypeOf(expected)) {
        return false;
      }

      return expected.call({}, actual) === true;
    }

    function _tryBlock(block) {
      var error;
      try {
        block();
      } catch (e) {
        error = e;
      }
      return error;
    }

    function _throws(shouldThrow, block, expected, message) {
      var actual;

      if (typeof block !== 'function') {
        throw new TypeError('"block" argument must be a function');
      }

      if (typeof expected === 'string') {
        message = expected;
        expected = null;
      }

      actual = _tryBlock(block);

      message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
                (message ? ' ' + message : '.');

      if (shouldThrow && !actual) {
        fail(actual, expected, 'Missing expected exception' + message);
      }

      var userProvidedMessage = typeof message === 'string';
      var isUnwantedException = !shouldThrow && isError(actual);
      var isUnexpectedException = !shouldThrow && actual && !expected;

      if ((isUnwantedException &&
          userProvidedMessage &&
          expectedException(actual, expected)) ||
          isUnexpectedException) {
        fail(actual, expected, 'Got unwanted exception' + message);
      }

      if ((shouldThrow && actual && expected &&
          !expectedException(actual, expected)) || (!shouldThrow && actual)) {
        throw actual;
      }
    }
    function throws(block, /*optional*/error, /*optional*/message) {
      _throws(true, block, error, message);
    }

    var __spreadArrays$2 = (undefined && undefined.__spreadArrays) || function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };
    describe('EBDD suite functions', function () {
        function assertBDDDescribe(ebddDescribeAny, bddDescribeAny) {
            var title = '123';
            var fn = function () { };
            var actual = ebddDescribeAny(title, fn);
            ok(bddDescribeAny.calledOnce);
            var firstCall = bddDescribeAny.firstCall;
            deepStrictEqual(firstCall.args, [title, fn]);
            strictEqual(actual, firstCall.returnValue);
        }
        function assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList) {
            var suiteCallback = function (letter) { };
            assertBDDDescribesWithParams(ebddDescribeAny, bddDescribeAnyList, '"#" is good', suiteCallback, function (_a) {
                var letter = _a[0];
                return "\"" + letter + "\" is good";
            }, [['A'], ['B'], ['C'], ['D'], ['E']]);
        }
        function assertBDDDescribesWithParams(ebddDescribeAny, bddDescribeAnyList, titlePattern, suiteCallback, getExpectedTitle, expectedParamsList) {
            var suiteCallbackSpy = sinon.spy(suiteCallback);
            var actualDescribeReturnValue = ebddDescribeAny(titlePattern, suiteCallbackSpy);
            var uniqueBDDDescribeAny = [];
            var bddDescribeAnyCalls = getCallsInExpectedOrder(bddDescribeAnyList, uniqueBDDDescribeAny);
            // describe callback order
            bddDescribeAnyCalls.reduce(function (previousSpy, currentSpy) {
                ok(currentSpy.calledImmediatelyAfter(previousSpy));
                return currentSpy;
            });
            // describe callback counts
            uniqueBDDDescribeAny.forEach(function (bddDescribeAny) {
                strictEqual(bddDescribeAny.callCount, bddDescribeAny.nextCallIndex);
            });
            // Suite titles
            bddDescribeAnyCalls.forEach(function (_a, index) {
                var actualTitle = _a.args[0];
                var expectedParams = expectedParamsList[index];
                var expectedTitle = getExpectedTitle(expectedParams);
                strictEqual(actualTitle, expectedTitle);
            });
            // Suite callback functions calls
            bddDescribeAnyCalls.forEach(function (_a, index) {
                var _b = _a.args, actualSuiteCallback = _b[1];
                suiteCallbackSpy.resetHistory();
                var expectedThis = {};
                actualSuiteCallback.call(expectedThis);
                var lastCall = suiteCallbackSpy.lastCall;
                deepStrictEqual(lastCall.thisValue, expectedThis);
                deepStrictEqual(lastCall.args, expectedParamsList[index]);
            });
            // Return value
            ok(isArrayBased(actualDescribeReturnValue));
            deepStrictEqual(__spreadArrays$2(actualDescribeReturnValue), bddDescribeAnyCalls.map(function (_a) {
                var returnValue = _a.returnValue;
                return returnValue;
            }));
            // Return value parent
            deepStrictEqual(actualDescribeReturnValue.parent, expectedParent);
            // Return value timeout
            var suiteCount = bddDescribeAnyList.length;
            var expectedTimeout = (suiteCount + 1) * 500;
            deepStrictEqual(actualDescribeReturnValue.timeout(), expectedTimeout);
            var timeout = 42;
            actualDescribeReturnValue.timeout(timeout);
            for (var _i = 0, actualDescribeReturnValue_1 = actualDescribeReturnValue; _i < actualDescribeReturnValue_1.length; _i++) {
                var suite_1 = actualDescribeReturnValue_1[_i];
                deepStrictEqual(suite_1.timeout(), timeout);
            }
        }
        function getCallsInExpectedOrder(bddDescribeAnyList, uniqueBDDDescribeAny) {
            if (uniqueBDDDescribeAny === void 0) { uniqueBDDDescribeAny = []; }
            var bddDescribeAnyCalls = bddDescribeAnyList.map(function (bddDescribeAny) {
                var _a;
                if (uniqueBDDDescribeAny.indexOf(bddDescribeAny) < 0)
                    uniqueBDDDescribeAny.push(bddDescribeAny);
                var nextCallIndex = (_a = bddDescribeAny.nextCallIndex) !== null && _a !== void 0 ? _a : 0;
                bddDescribeAny.nextCallIndex = nextCallIndex + 1;
                var spyCall = bddDescribeAny.getCall(nextCallIndex);
                return spyCall;
            });
            return bddDescribeAnyCalls;
        }
        function getTestParams() {
            var params = [
                'A',
                ebdd.only('B'),
                ebdd.skip('C'),
                ebdd.when(true, 'D'),
                ebdd.when(false, 'E'),
            ];
            return params;
        }
        var bddDescribe;
        var bddDescribeOnly;
        var bddDescribeSkip;
        var ebdd;
        var expectedParent;
        var sandbox;
        beforeEach(function () {
            function newSuite(title, parentContext) {
                var suite = new Mocha.Suite(title, parentContext);
                suite.parent = expectedParent;
                suite.timeout(timeout += 1000);
                return suite;
            }
            sandbox = sinon.createSandbox();
            expectedParent = new Mocha.Suite('Parent Suite');
            var timeout = 0;
            var describe = bddDescribe = sandbox.stub().callsFake(newSuite);
            bddDescribeOnly = describe.only = sandbox.stub().callsFake(newSuite);
            bddDescribeSkip = describe.skip = sandbox.stub().callsFake(newSuite);
            sandbox.stub(Mocha.interfaces, 'bdd').callsFake(function (suite) {
                suite.on('pre-require', function (context) {
                    context.describe = describe;
                });
            });
            ebdd = loadEBDD();
        });
        afterEach(function () { return sandbox.restore(); });
        after(function () {
            var _a;
            (_a = {}, bddDescribe = _a.bddDescribe, bddDescribeOnly = _a.bddDescribeOnly, bddDescribeSkip = _a.bddDescribeSkip, ebdd = _a.ebdd);
        });
        it('describe', function () { return assertBDDDescribe(ebdd.describe, bddDescribe); });
        it('describe.only', function () { return assertBDDDescribe(ebdd.describe.only, bddDescribeOnly); });
        it('describe.only.only', function () { return throws(function () { return void ebdd.describe.only.only; }, Error); });
        it('describe.only.skip', function () { return throws(function () { return void ebdd.describe.only.skip; }, Error); });
        it('describe.only.when(true)', function () { return assertBDDDescribe(ebdd.describe.only.when(true), bddDescribeOnly); });
        it('describe.only.when(false)', function () { return assertBDDDescribe(ebdd.describe.only.when(false), bddDescribeSkip); });
        it('describe.only.per([...])', function () {
            var ebddDescribeAny = ebdd.describe.only.per(getTestParams());
            var bddDescribeAnyList = [
                bddDescribeOnly,
                bddDescribeOnly,
                bddDescribeSkip,
                bddDescribeOnly,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
        });
        it('describe.skip', function () { return assertBDDDescribe(ebdd.describe.skip, bddDescribeSkip); });
        it('describe.skip.only', function () { return throws(function () { return void ebdd.describe.skip.only; }, Error); });
        it('describe.skip.skip', function () { return throws(function () { return void ebdd.describe.skip.skip; }, Error); });
        it('describe.skip.when(true)', function () { return assertBDDDescribe(ebdd.describe.skip.when(true), bddDescribeSkip); });
        it('describe.skip.when(false)', function () { return assertBDDDescribe(ebdd.describe.skip.when(false), bddDescribeSkip); });
        it('describe.skip.per([...])', function () {
            var ebddDescribeAny = ebdd.describe.skip.per(getTestParams());
            var bddDescribeAnyList = [
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
        });
        it('describe.when(true)', function () { return assertBDDDescribe(ebdd.describe.when(true), bddDescribe); });
        it('describe.when(true).only', function () { return assertBDDDescribe(ebdd.describe.when(true).only, bddDescribeOnly); });
        it('describe.when(true).skip', function () { return assertBDDDescribe(ebdd.describe.when(true).skip, bddDescribeSkip); });
        it('describe.when(true).when(true)', function () { return assertBDDDescribe(ebdd.describe.when(true).when(true), bddDescribe); });
        it('describe.when(true).when(false)', function () { return assertBDDDescribe(ebdd.describe.when(true).when(false), bddDescribeSkip); });
        it('describe.when(true).per([...])', function () {
            var ebddDescribeAny = ebdd.describe.when(true).per(getTestParams());
            var bddDescribeAnyList = [bddDescribe, bddDescribeOnly, bddDescribeSkip, bddDescribe, bddDescribeSkip];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
        });
        it('describe.when(false)', function () { return assertBDDDescribe(ebdd.describe.when(false), bddDescribeSkip); });
        it('describe.when(false).only', function () { return assertBDDDescribe(ebdd.describe.when(false).only, bddDescribeSkip); });
        it('describe.when(false).skip', function () { return assertBDDDescribe(ebdd.describe.when(false).skip, bddDescribeSkip); });
        it('describe.when(false).when(true)', function () { return assertBDDDescribe(ebdd.describe.when(false).when(true), bddDescribeSkip); });
        it('describe.when(false).when(false)', function () { return assertBDDDescribe(ebdd.describe.when(false).when(false), bddDescribeSkip); });
        it('describe.when(false).per([...])', function () {
            var ebddDescribeAny = ebdd.describe.when(false).per(getTestParams());
            var bddDescribeAnyList = [
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
        });
        it('describe.per([...]).only', function () {
            var ebddDescribeAny = ebdd.describe.per(getTestParams()).only;
            var bddDescribeAnyList = [
                bddDescribeOnly,
                bddDescribeOnly,
                bddDescribeSkip,
                bddDescribeOnly,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
        });
        it('describe.per([...]).skip', function () {
            var ebddDescribeAny = ebdd.describe.per(getTestParams()).skip;
            var bddDescribeAnyList = [
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
        });
        it('describe.per([...]).when(true)', function () {
            var ebddDescribeAny = ebdd.describe.per(getTestParams()).when(true);
            var bddDescribeAnyList = [bddDescribe, bddDescribeOnly, bddDescribeSkip, bddDescribe, bddDescribeSkip];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
        });
        it('describe.per([...]).when(false)', function () {
            var ebddDescribeAny = ebdd.describe.per(getTestParams()).when(false);
            var bddDescribeAnyList = [
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
        });
        it('describe.per([...]).per([...])', function () {
            var ebddDescribeAny = ebdd.describe
                .per({ 0: 3, 1: ebdd.only(7), 2: ebdd.skip(11), length: 3 })
                .per(['potatoes', ebdd.only('tomatoes'), ebdd.skip('pizzas')]);
            var bddDescribeAnyList = [
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
            var expectedParamsList = [
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
            var suiteCallback = function (count, food) { };
            assertBDDDescribesWithParams(ebddDescribeAny, bddDescribeAnyList, '#1 #2', suiteCallback, function (_a) {
                var count = _a[0], food = _a[1];
                return count + " " + food;
            }, expectedParamsList);
        });
        it('describe.adapt(...)', function () {
            var suiteCallback = function () { };
            var adaptParams = [42, 'foo', {}];
            var adapter = sinon.spy();
            var adaptedDescribe = ebdd.describe.adapt(adapter);
            adaptedDescribe.apply(void 0, __spreadArrays$2(['some title', suiteCallback], adaptParams));
            ok(!('adapt' in adaptedDescribe));
            ok('only' in adaptedDescribe);
            ok('per' in adaptedDescribe);
            ok('skip' in adaptedDescribe);
            ok('when' in adaptedDescribe);
            ok(adapter.calledOnce);
            var lastCall = adapter.lastCall;
            deepStrictEqual(lastCall.thisValue, bddDescribe.lastCall.returnValue);
            deepStrictEqual(lastCall.args, adaptParams);
        });
        it('describe.adapt(...).per([...])', function () {
            var suiteCallback = function (letter) { };
            var adaptParams = [42, 'foo', {}];
            var adapter = sinon.spy();
            var adaptedDescribe = ebdd.describe.adapt(adapter);
            adaptedDescribe.per(getTestParams()).apply(void 0, __spreadArrays$2(['some title', suiteCallback], adaptParams));
            var bddDescribeAnyList = [
                bddDescribe,
                bddDescribeOnly,
                bddDescribeSkip,
                bddDescribe,
                bddDescribeSkip,
            ];
            var bddDescribeAnyCalls = getCallsInExpectedOrder(bddDescribeAnyList);
            bddDescribeAnyCalls.forEach(function (bddDescribeAnyCall, index) {
                var adapterCall = adapter.getCall(index);
                deepStrictEqual(adapterCall.thisValue, bddDescribeAnyCall.returnValue);
            });
            ok(adapter.alwaysCalledWithExactly.apply(adapter, adaptParams));
        });
        it('describe.adapt with undefined adapter function', function () { return throws(function () { return ebdd.describe.adapt(undefined); }, TypeError); });
        it('describe.adapt with invalid adapter function', function () { return throws(function () { return ebdd.describe.adapt({}); }, TypeError); });
        it('context', function () { return strictEqual(ebdd.context, ebdd.describe); });
        it('xdescribe', function () { return assertBDDDescribe(ebdd.xdescribe, bddDescribeSkip); });
        it('xdescribe.only', function () { return throws(function () { return void ebdd.xdescribe.only; }, Error); });
        it('xdescribe.skip', function () { return throws(function () { return void ebdd.xdescribe.skip; }, Error); });
        it('xdescribe.when(true)', function () { return assertBDDDescribe(ebdd.xdescribe.when(true), bddDescribeSkip); });
        it('xdescribe.when(false)', function () { return assertBDDDescribe(ebdd.xdescribe.when(false), bddDescribeSkip); });
        it('xdescribe.per([...])', function () {
            var ebddDescribeAny = ebdd.xdescribe.per(getTestParams());
            var bddDescribeAnyList = [
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAnyList);
        });
        it('xcontext', function () { return strictEqual(ebdd.xcontext, ebdd.xdescribe); });
        it('unparameterized describe with undefined title', function () {
            var fn = function () { };
            throws(function () { return ebdd.describe(undefined, fn); }, TypeError);
        });
        it('unparameterized describe with invalid title', function () {
            var fn = function () { };
            throws(function () { return ebdd.describe({}, fn); }, TypeError);
        });
        it('unparameterized describe with undefined callback function', function () { return throws(function () { return ebdd.describe('suite', undefined); }, TypeError); });
        it('unparameterized describe with invalid callback function', function () { return throws(function () { return ebdd.describe('suite', {}); }, TypeError); });
        it('unparameterized describe with callback function accepting wrong number of arguments', function () {
            var fn = function (arg0) { };
            throws(function () { return ebdd.describe('suite', fn); }, RangeError);
        });
        it('parameterized describe with undefined title', function () {
            var fn = function () { };
            throws(function () { return ebdd.describe.per([0])(undefined, fn); }, TypeError);
        });
        it('parameterized describe with invalid title', function () {
            var fn = function () { };
            throws(function () { return ebdd.describe.per([0])({}, fn); }, TypeError);
        });
        it('parameterized describe with undefined callback function', function () { return throws(function () { return ebdd.describe.per([0])('suite', undefined); }, TypeError); });
        it('parameterized describe with invalid callback function', function () { return throws(function () { return ebdd.describe.per([0])('suite', {}); }, TypeError); });
        it('parameterized describe with callback function accepting wrong number of arguments', function () {
            var fn = function () { };
            throws(function () { return ebdd.describe.per([0])('suite', fn); }, RangeError);
        });
        it('per with undefined argument', function () { return throws(function () { return ebdd.describe.per(undefined); }, TypeError); });
        it('per with null argument', function () { return throws(function () { return ebdd.describe.per(null); }, TypeError); });
        it('per with empty array-like', function () { return throws(function () { return ebdd.describe.per(''); }, TypeError); });
        it('per with invalid parameter', function () {
            var paramInfo = new ParamInfo(42, 'foo');
            throws(function () { return ebdd.describe.per([paramInfo]); }, TypeError);
        });
    });

    var __spreadArrays$3 = (undefined && undefined.__spreadArrays) || function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };
    describe('EBDD test functions', function () {
        function assertBDDIt(ebddItAny, bddCallData) {
            var it = bddCallData.it, useFn = bddCallData.useFn;
            var title = '123';
            {
                var fn = function () { };
                var actualItReturnValue = ebddItAny(title, fn);
                ok(it.calledOnce);
                var lastCall = it.lastCall;
                deepStrictEqual(lastCall.args, useFn ? [title, fn] : [title]);
                strictEqual(actualItReturnValue, lastCall.returnValue);
            }
            {
                var fn = function (done) { };
                var actualItReturnValue = ebddItAny(title, fn);
                ok(it.calledTwice);
                var lastCall = it.lastCall;
                deepStrictEqual(lastCall.args, useFn ? [title, fn] : [title]);
                strictEqual(actualItReturnValue, lastCall.returnValue);
            }
        }
        function assertBDDIts(ebddItAny, bddCallDataList) {
            {
                var testCallback = function (letter) { };
                assertBDDItsWithParams(ebddItAny, bddCallDataList, '"#" is good', testCallback, function (_a) {
                    var letter = _a[0];
                    return "\"" + letter + "\" is good";
                }, [['A'], ['B'], ['C'], ['D'], ['E']], [], 3000);
            }
            {
                var testCallback = function (letter, done) { };
                var done = function () { };
                assertBDDItsWithParams(ebddItAny, bddCallDataList, '"#" is good', testCallback, function (_a) {
                    var letter = _a[0];
                    return "\"" + letter + "\" is good";
                }, [['A'], ['B'], ['C'], ['D'], ['E']], [done], 8000);
            }
        }
        function assertBDDItsWithParams(ebddItAny, bddCallDataList, titlePattern, testCallback, getExpectedTitle, expectedParamsList, extraArgs, expectedTimeout) {
            var testCallbackSpy = sinon.spy(testCallback);
            var actualItReturnValue = ebddItAny(titlePattern, testCallbackSpy);
            var uniqueBDDItAny = [];
            var bddItAnyCalls = getCallsInExpectedOrder(bddCallDataList, uniqueBDDItAny);
            // it callback order
            bddItAnyCalls.reduce(function (previousSpy, currentSpy) {
                ok(currentSpy.calledImmediatelyAfter(previousSpy));
                return currentSpy;
            });
            // it callback counts
            uniqueBDDItAny.forEach(function (it) {
                strictEqual(it.callCount, it.nextCallIndex);
            });
            // Test titles
            bddItAnyCalls.forEach(function (_a, index) {
                var actualTitle = _a.args[0];
                var expectedParams = expectedParamsList[index];
                var expectedTitle = getExpectedTitle(expectedParams);
                strictEqual(actualTitle, expectedTitle);
            });
            // Test callback functions calls
            bddItAnyCalls.forEach(function (_a, index) {
                var _b;
                var _c = _a.args, actualTestCallback = _c[1];
                deepStrictEqual(typeof actualTestCallback, bddCallDataList[index].useFn ? 'function' : 'undefined');
                if (actualTestCallback) {
                    testCallbackSpy.resetHistory();
                    var expectedThis = {};
                    (_b = actualTestCallback).call.apply(_b, __spreadArrays$3([expectedThis], extraArgs));
                    var lastCall = testCallbackSpy.lastCall;
                    deepStrictEqual(lastCall.thisValue, expectedThis);
                    deepStrictEqual(lastCall.args, __spreadArrays$3(expectedParamsList[index], extraArgs));
                }
            });
            // Return value
            ok(isArrayBased(actualItReturnValue));
            deepStrictEqual(__spreadArrays$3(actualItReturnValue), bddItAnyCalls.map(function (_a) {
                var returnValue = _a.returnValue;
                return returnValue;
            }));
            // Return value parent
            deepStrictEqual(actualItReturnValue.parent, expectedParent);
            // Return value timeout
            deepStrictEqual(actualItReturnValue.timeout(), expectedTimeout);
            var timeout = 42;
            actualItReturnValue.timeout(timeout);
            for (var _i = 0, actualItReturnValue_1 = actualItReturnValue; _i < actualItReturnValue_1.length; _i++) {
                var test_1 = actualItReturnValue_1[_i];
                deepStrictEqual(test_1.timeout(), timeout);
            }
        }
        function getCallsInExpectedOrder(bddCallDataList, uniqueBDDItAny) {
            if (uniqueBDDItAny === void 0) { uniqueBDDItAny = []; }
            var bddItAnyCalls = bddCallDataList.map(function (bddCallData) {
                var _a;
                var bddItAny = bddCallData.it;
                if (uniqueBDDItAny.indexOf(bddItAny) < 0)
                    uniqueBDDItAny.push(bddItAny);
                var nextCallIndex = (_a = bddItAny.nextCallIndex) !== null && _a !== void 0 ? _a : 0;
                bddItAny.nextCallIndex = nextCallIndex + 1;
                var spyCall = bddItAny.getCall(nextCallIndex);
                return spyCall;
            });
            return bddItAnyCalls;
        }
        function getTestParams() {
            var params = [
                'A',
                ebdd.only('B'),
                ebdd.skip('C'),
                ebdd.when(true, 'D'),
                ebdd.when(false, 'E'),
            ];
            return params;
        }
        var bddIt;
        var bddItOnly;
        var bddItSkip;
        var ebdd;
        var expectedParent;
        var sandbox;
        beforeEach(function () {
            function newTest(title, fn) {
                var test = new Mocha.Test(title, fn);
                test.parent = expectedParent;
                test.timeout(timeout += 1000);
                return test;
            }
            sandbox = sinon.createSandbox();
            expectedParent = new Mocha.Suite('Parent Suite');
            var timeout = 0;
            var it = sandbox.stub().callsFake(newTest);
            bddIt = { it: it, useFn: true };
            bddItSkip = { it: it, useFn: false };
            it.only = sandbox.stub().callsFake(newTest);
            bddItOnly = { it: it.only, useFn: true };
            sandbox.stub(Mocha.interfaces, 'bdd').callsFake(function (suite) {
                suite.on('pre-require', function (context) {
                    context.it = it;
                });
            });
            ebdd = loadEBDD();
        });
        afterEach(function () { return sandbox.restore(); });
        after(function () {
            var _a;
            (_a = {}, bddIt = _a.bddIt, bddItOnly = _a.bddItOnly, bddItSkip = _a.bddItSkip, ebdd = _a.ebdd, expectedParent = _a.expectedParent, sandbox = _a.sandbox);
        });
        it('it', function () { return assertBDDIt(ebdd.it, bddIt); });
        it('it.only', function () { return assertBDDIt(ebdd.it.only, bddItOnly); });
        it('it.only.only', function () { return throws(function () { return void ebdd.it.only.only; }, Error); });
        it('it.only.skip', function () { return throws(function () { return void ebdd.it.only.skip; }, Error); });
        it('it.only.when(true)', function () { return assertBDDIt(ebdd.it.only.when(true), bddItOnly); });
        it('it.only.when(false)', function () { return assertBDDIt(ebdd.it.only.when(false), bddItSkip); });
        it('it.only.per([...])', function () {
            var ebddItAny = ebdd.it.only.per(getTestParams());
            var bddCallDataList = [bddItOnly, bddItOnly, bddItSkip, bddItOnly, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.skip', function () { return assertBDDIt(ebdd.it.skip, bddItSkip); });
        it('it.skip.only', function () { return throws(function () { return void ebdd.it.skip.only; }, Error); });
        it('it.skip.skip', function () { return throws(function () { return void ebdd.it.skip.skip; }, Error); });
        it('it.skip.when(true)', function () { return assertBDDIt(ebdd.it.skip.when(true), bddItSkip); });
        it('it.skip.when(false)', function () { return assertBDDIt(ebdd.it.skip.when(false), bddItSkip); });
        it('it.skip.per([...])', function () {
            var ebddItAny = ebdd.it.skip.per(getTestParams());
            var bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.when(true)', function () { return assertBDDIt(ebdd.it.when(true), bddIt); });
        it('it.when(true).only', function () { return assertBDDIt(ebdd.it.when(true).only, bddItOnly); });
        it('it.when(true).skip', function () { return assertBDDIt(ebdd.it.when(true).skip, bddItSkip); });
        it('it.when(true).when(true)', function () { return assertBDDIt(ebdd.it.when(true).when(true), bddIt); });
        it('it.when(true).when(false)', function () { return assertBDDIt(ebdd.it.when(true).when(false), bddItSkip); });
        it('it.when(true).per([...])', function () {
            var ebddItAny = ebdd.it.when(true).per(getTestParams());
            var bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.when(false)', function () { return assertBDDIt(ebdd.it.when(false), bddItSkip); });
        it('it.when(false).only', function () { return assertBDDIt(ebdd.it.when(false).only, bddItSkip); });
        it('it.when(false).skip', function () { return assertBDDIt(ebdd.it.when(false).skip, bddItSkip); });
        it('it.when(false).when(true)', function () { return assertBDDIt(ebdd.it.when(false).when(true), bddItSkip); });
        it('it.when(false).when(false)', function () { return assertBDDIt(ebdd.it.when(false).when(false), bddItSkip); });
        it('it.when(false).per([...])', function () {
            var ebddItAny = ebdd.it.when(false).per(getTestParams());
            var bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.per([...]).only', function () {
            var ebddItAny = ebdd.it.per(getTestParams()).only;
            var bddCallDataList = [bddItOnly, bddItOnly, bddItSkip, bddItOnly, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.per([...]).skip', function () {
            var ebddItAny = ebdd.it.per(getTestParams()).skip;
            var bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.per([...]).when(true)', function () {
            var ebddItAny = ebdd.it.per(getTestParams()).when(true);
            var bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.per([...]).when(false)', function () {
            var ebddItAny = ebdd.it.per(getTestParams()).when(false);
            var bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.per([...]).per([...])', function () {
            var ebddItAny = ebdd.it
                .per({ 0: 3, 1: ebdd.only(7), 2: ebdd.skip(11), length: 3 })
                .per(['potatoes', ebdd.only('tomatoes'), ebdd.skip('pizzas')]);
            var bddCallDataList = [
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
            var expectedParamsList = [
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
            var testCallback = function (count, food) { };
            assertBDDItsWithParams(ebddItAny, bddCallDataList, '#1 #2', testCallback, function (_a) {
                var count = _a[0], food = _a[1];
                return count + " " + food;
            }, expectedParamsList, [], 5000);
        });
        it('it.adapt(...)', function () {
            var testCallback = function () { };
            var adaptParams = [42, 'foo', {}];
            var adapter = sinon.spy();
            var adaptedIt = ebdd.it.adapt(adapter);
            adaptedIt.apply(void 0, __spreadArrays$3(['some title', testCallback], adaptParams));
            ok(!('adapt' in adaptedIt));
            ok('only' in adaptedIt);
            ok('per' in adaptedIt);
            ok('skip' in adaptedIt);
            ok('when' in adaptedIt);
            ok(adapter.calledOnce);
            var lastCall = adapter.lastCall;
            deepStrictEqual(lastCall.thisValue, bddIt.it.lastCall.returnValue);
            deepStrictEqual(lastCall.args, adaptParams);
        });
        it('it.adapt(...).per([...])', function () {
            var testCallback = function (letter) { };
            var adaptParams = [42, 'foo', {}];
            var adapter = sinon.spy();
            var adaptedIt = ebdd.it.adapt(adapter);
            adaptedIt.per(getTestParams()).apply(void 0, __spreadArrays$3(['some title', testCallback], adaptParams));
            var bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];
            var bddItAnyCalls = getCallsInExpectedOrder(bddCallDataList);
            bddItAnyCalls.forEach(function (bddItAnyCall, index) {
                var adapterCall = adapter.getCall(index);
                deepStrictEqual(adapterCall.thisValue, bddItAnyCall.returnValue);
            });
            ok(adapter.alwaysCalledWithExactly.apply(adapter, adaptParams));
        });
        it('it.adapt with undefined adapter function', function () { return throws(function () { return ebdd.it.adapt(undefined); }, TypeError); });
        it('it.adapt with invalid adapter function', function () { return throws(function () { return ebdd.it.adapt({}); }, TypeError); });
        it('specify', function () { return strictEqual(ebdd.specify, ebdd.it); });
        it('xit', function () { return assertBDDIt(ebdd.xit, bddItSkip); });
        it('xit.only', function () { return throws(function () { return void ebdd.xit.only; }, Error); });
        it('xit.skip', function () { return throws(function () { return void ebdd.xit.skip; }, Error); });
        it('xit.when(true)', function () { return assertBDDIt(ebdd.xit.when(true), bddItSkip); });
        it('xit.when(false)', function () { return assertBDDIt(ebdd.xit.when(false), bddItSkip); });
        it('xit.per([...])', function () {
            var ebddItAny = ebdd.xit.per(getTestParams());
            var bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('xspecify', function () { return strictEqual(ebdd.xspecify, ebdd.xit); });
        it('unparameterized it with undefined title', function () {
            var fn = function () { };
            throws(function () { return ebdd.it(undefined, fn); }, TypeError);
        });
        it('unparameterized it with invalid title', function () {
            var fn = function () { };
            throws(function () { return ebdd.it({}, fn); }, TypeError);
        });
        it('unparameterized it with undefined callback function', function () { return throws(function () { return ebdd.it('test', undefined); }, TypeError); });
        it('unparameterized it with invalid callback function', function () { return throws(function () { return ebdd.it('test', {}); }, TypeError); });
        it('unparameterized it with callback function accepting wrong number of arguments', function () {
            var fn = function (arg0, arg1) { };
            throws(function () { return ebdd.it('test', fn); }, RangeError);
        });
        it('parameterized it with undefined title', function () {
            var fn = function () { };
            throws(function () { return ebdd.it.per([0])(undefined, fn); }, TypeError);
        });
        it('parameterized it with invalid title', function () {
            var fn = function () { };
            throws(function () { return ebdd.it.per([0])({}, fn); }, TypeError);
        });
        it('parameterized it with undefined callback function', function () { return throws(function () { return ebdd.it.per([0])('test', undefined); }, TypeError); });
        it('parameterized it with invalid callback function', function () { return throws(function () { return ebdd.it.per([0])('test', {}); }, TypeError); });
        it('parameterized it with callback function accepting wrong number of arguments', function () {
            var fn = function () { };
            throws(function () { return ebdd.it.per([0])('test', fn); }, RangeError);
        });
        it('per with undefined argument', function () { return throws(function () { return ebdd.it.per(undefined); }, TypeError); });
        it('per with null argument', function () { return throws(function () { return ebdd.it.per(null); }, TypeError); });
        it('per with empty array-like', function () { return throws(function () { return ebdd.it.per(''); }, TypeError); });
        it('per with invalid parameter', function () {
            var paramInfo = new ParamInfo(42, 'foo');
            throws(function () { return ebdd.it.per([paramInfo]); }, TypeError);
        });
    });

    describe('ebdd sets up correctly', function () {
        function test(mocha, ebddThis) {
            if (mocha === void 0) { mocha = new Mocha__default(); }
            var suite = mocha.suite;
            suite.removeAllListeners();
            ebdd.call(ebddThis, suite);
            var listeners = suite.listeners('pre-require');
            strictEqual(listeners.length, 1);
            var bddPreRequireListener;
            sandbox.stub(suite, 'on').callsFake(function (event, listener) {
                bddPreRequireListener = sandbox.spy(listener);
                var suite = this.addListener(event, bddPreRequireListener);
                return suite;
            });
            var bddSpy = sandbox.spy(Mocha.interfaces, 'bdd');
            var context = {};
            var file = '?';
            suite.emit('pre-require', context, file, mocha);
            ok(bddSpy.calledOnce);
            ok(bddSpy.calledWithExactly(suite));
            ok(bddPreRequireListener.calledOnce);
            ok(bddPreRequireListener.calledWithExactly(context, file, mocha));
            strictEqual(typeof context.only, 'function');
            strictEqual(typeof context.skip, 'function');
            strictEqual(typeof context.when, 'function');
        }
        var sandbox;
        beforeEach(function () {
            Mocha.interfaces.ebdd = ebdd;
            sandbox = sinon.createSandbox();
        });
        afterEach(function () { return sandbox.restore(); });
        after(function () {
            delete Mocha.interfaces.ebdd;
            sandbox = null;
        });
        it('normally', function () {
            test();
        });
        // Suite.prototype.getMaxListeners does not exist in Node.js < 1.
        describe('without getMaxListeners in suite', function () {
            it('with _maxListeners not set', function () {
                var prototype = Mocha.Suite.prototype;
                if (!('getMaxListeners' in prototype))
                    this.skip();
                sandbox.stub(prototype, 'getMaxListeners').value(undefined);
                var mocha = new Mocha__default();
                delete mocha.suite._maxListeners;
                test(mocha);
            });
            it('with _maxListeners set', function () {
                var prototype = Mocha.Suite.prototype;
                if (!('getMaxListeners' in prototype))
                    this.skip();
                sandbox.stub(prototype, 'getMaxListeners').value(undefined);
                var mocha = new Mocha__default();
                mocha.suite.setMaxListeners(10);
                test(mocha);
            });
        });
        // Suite.prototype.getMaxListeners and Suite.prototype.setMaxListeners are both missing in
        // browsers in older versions of Mocha.
        it('without getMaxListeners and setMaxListener in suite', function () {
            var prototype = Mocha.Suite.prototype;
            if (!('setMaxListeners' in prototype))
                this.skip();
            if ('getMaxListeners' in prototype)
                sandbox.stub(prototype, 'getMaxListeners').value(undefined);
            sandbox.stub(prototype, 'setMaxListeners').value(undefined);
            test();
        });
        // In older versions of Mocha, the test UI function is called with the Mocha object as this.
        // This behavior has changhed in Mocha 6.0.1.
        // With newer versions, the Mocha object is not known until the pre-require callback runs.
        it('when called on Mocha object', function () {
            var mocha = new Mocha__default();
            test(mocha, mocha);
        });
    });

    describe('skip, only and when', function () {
        var only;
        var skip;
        var when;
        beforeEach(function () {
            var _a;
            (_a = loadEBDD(), only = _a.only, skip = _a.skip);
        });
        after(function () {
            var _a;
            (_a = {}, only = _a.only, skip = _a.skip);
        });
        it('skip(skip(...))', function () { return throws(function () { return skip(skip({})); }); });
        it('skip(only(...))', function () { return throws(function () { return skip(only({})); }); });
        it('skip(when(true, ...))', function () { return throws(function () { return skip(when()); }); });
        it('skip(when(false, ...))', function () { return throws(function () { return skip(when()); }); });
        it('only(skip(...))', function () { return throws(function () { return only(skip({})); }); });
        it('only(only(...))', function () { return throws(function () { return only(only({})); }); });
        it('only(when(true, ...))', function () { return throws(function () { return only(when()); }); });
        it('only(when(false, ...))', function () { return throws(function () { return only(when()); }); });
        it('when(true, skip(...))', function () { return throws(function () { return when(); }); });
        it('when(true, only(...))', function () { return throws(function () { return when(); }); });
        it('when(true, when(true, ...))', function () { return throws(function () { return when(); }); });
        it('when(true, when(false, ...))', function () { return throws(function () { return when(); }); });
        it('when(false, skip(...))', function () { return throws(function () { return when(); }); });
        it('when(false, only(...))', function () { return throws(function () { return when(); }); });
        it('when(false, when(true, ...))', function () { return throws(function () { return when(); }); });
        it('when(false, when(false, ...))', function () { return throws(function () { return when(); }); });
    });

    describe('TitleFormatter', function () {
        function newTitleFormatterThrows(titlePattern, paramCount, expectedMessage) {
            throws(function () { return new TitleFormatter(titlePattern, paramCount); }, function (error) { return error.constructor === Error || error.message === expectedMessage; });
        }
        it('formats an empty title', function () {
            var titleFormatter = new TitleFormatter('', 1);
            strictEqual(titleFormatter([null]), '');
        });
        it('formats a title without placeholders', function () {
            var titleFormatter = new TitleFormatter('foo \\#1 bar \\#2', 1);
            strictEqual(titleFormatter([null]), 'foo #1 bar #2');
        });
        it('formats a title with placeholders', function () {
            var titleFormatter = new TitleFormatter('Happy Birthday #[0].name!', 1);
            strictEqual(titleFormatter([[{ name: 'ebdd' }]]), 'Happy Birthday ebdd!');
        });
        it('formats a title with placeholders', function () {
            var titleFormatter = new TitleFormatter('#1.data.title #1["\\"first-name\\""] #1[\'"last-name"\'] aka #2', 2);
            var actual = titleFormatter([{ '"first-name"': 'James', '"last-name"': 'Bond' }, '007']);
            strictEqual(actual, ' James Bond aka 007');
        });
        it('throws an error when referencing more than one parameter', function () {
            return newTitleFormatterThrows('#2.$=', 1, 'The placeholder #2.$ is invalid because there is only one parameter.');
        });
        it('throws an error when referencing more parameters than provided', function () {
            return newTitleFormatterThrows('#11.$=/', 10, 'The placeholder #11.$ is invalid because there are only 10 parameters.');
        });
        it('throws an error when referencing # while there are 2 parameters', function () {
            return newTitleFormatterThrows('#[0] #', 2, 'The placeholder #[0] is ambiguous because there are 2 parameters. ' +
                'Use #1 or #2 instead of # to refer to a specific parameter.');
        });
        it('throws an error when referencing # while there are 3 parameters', function () {
            return newTitleFormatterThrows('#', 3, 'The placeholder # is ambiguous because there are 3 parameters. ' +
                'Use #1, #2 or #3 instead of # to refer to a specific parameter.');
        });
        it('throws an error when referencing # while there are more than 3 parameters', function () {
            return newTitleFormatterThrows('#', 10, 'The placeholder # is ambiguous because there are 10 parameters. ' +
                'Use #1, #2, … #10 instead of # to refer to a specific parameter.');
        });
    });

}(Mocha, sinon));
