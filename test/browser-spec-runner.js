(function (mocha$1, sinon) {
    'use strict';

    /* eslint-env browser */
    /* global mocha */
    mocha.setup({ ignoreLeaks: false, reporter: MochaBar, ui: 'bdd' });
    addEventListener('DOMContentLoaded', function () {
        mocha.run();
    });

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
                var message = 'Invalid parameter. skip(...), only(...) and testIf(...) expressions cannot be nested.';
                throw TypeError(message);
            }
        }
        return ParamInfo;
    }());
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
                var suites = baseParamLists.map(function (paramList) {
                    var createSuite = getCreateSuite(paramList.mode);
                    var title = titleFormatter(paramList);
                    var fnWrapper = bindArguments(fn, paramList);
                    var suite = createSuite(title, fnWrapper);
                    return suite;
                });
                return suites;
            }
            stub.if =
                function (condition) {
                    return condition ? describe : skip(brand);
                };
            stub.per =
                function (params) {
                    var paramLists = multiplyParams(params, baseParamLists);
                    var describe = createParameterizedSuiteFunction(paramLists, brand);
                    return describe;
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
                var tests = baseParamLists.map(function (paramList) {
                    var createTest = getCreateTest(paramList.mode);
                    var title = titleFormatter(paramList);
                    var fnWrapper;
                    if (fn.length === paramCount) {
                        fnWrapper = bindArguments(fn, paramList);
                    }
                    else {
                        fnWrapper = bindArgumentsButLast(fn, paramList);
                    }
                    var test = createTest(title, fnWrapper);
                    return test;
                });
                return tests;
            }
            stub.if =
                function (condition) {
                    return condition ? it : skip(brand);
                };
            stub.per =
                function (params) {
                    var paramLists = multiplyParams(params, baseParamLists);
                    var it = createParameterizedTestFunction(paramLists, brand);
                    return it;
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
            stub.if =
                function (condition) {
                    return condition ? describe : createUnparameterizedSuiteFunction(Mode.SKIP, brand);
                };
            stub.per =
                function (params) {
                    var paramLists = createParamLists(params, baseMode);
                    var describe = createParameterizedSuiteFunction(paramLists, brand);
                    return describe;
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
            stub.if =
                function (condition) {
                    return condition ? it : createUnparameterizedTestFunction(Mode.SKIP, brand);
                };
            stub.per =
                function (params) {
                    var paramLists = createParamLists(params, baseMode);
                    var it = createParameterizedTestFunction(paramLists, brand);
                    return it;
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
        context.testIf =
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
        for (var _i = 0, baseParamLists_1 = baseParamLists; _i < baseParamLists_1.length; _i++) {
            var baseParamList = baseParamLists_1[_i];
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

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

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
      if (isArray(value)) {
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
    function isArray(ar) {
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

    describe('EBDD suite functions', function () {
        function assertBDDDescribe(ebddDescribeAny, bddDescribeAny) {
            var title = '123';
            var fn = function () { };
            var actual = ebddDescribeAny(title, fn);
            ok(bddDescribeAny.calledOnce);
            deepStrictEqual(bddDescribeAny.firstCall.args, [title, fn]);
            strictEqual(actual, bddDescribeAny.firstCall.returnValue);
        }
        function assertBDDDescribes(ebddDescribeAny, bddDescribeAny) {
            var suiteCallback = function (letter) { };
            assertBDDDescribesWithParams(ebddDescribeAny, bddDescribeAny, '"#" is good', suiteCallback, function (_a) {
                var letter = _a[0];
                return "\"" + letter + "\" is good";
            }, [['A'], ['B'], ['C'], ['D'], ['E']]);
        }
        function assertBDDDescribesWithParams(ebddDescribeAny, bddDescribeAny, titlePattern, suiteCallback, getExpectedTitle, expectedParamsList) {
            var suiteCallbackSpy = sinon.spy(suiteCallback);
            var actualDescribeReturnValue = ebddDescribeAny(titlePattern, suiteCallbackSpy);
            var uniqueBDDDescribeAny = [];
            var spyCalls = bddDescribeAny.map(function (bddDescribeAny) {
                if (uniqueBDDDescribeAny.indexOf(bddDescribeAny) < 0)
                    uniqueBDDDescribeAny.push(bddDescribeAny);
                var nextCallIndex = bddDescribeAny.nextCallIndex || 0;
                bddDescribeAny.nextCallIndex = nextCallIndex + 1;
                var spyCall = bddDescribeAny.getCall(nextCallIndex);
                return spyCall;
            });
            // describe callback order
            spyCalls.reduce(function (previousSpyCall, currentSpyCall) {
                ok(currentSpyCall.calledImmediatelyAfter(previousSpyCall));
                return currentSpyCall;
            });
            // describe callback counts
            uniqueBDDDescribeAny.forEach(function (bddDescribeAny) {
                strictEqual(bddDescribeAny.callCount, bddDescribeAny.nextCallIndex);
            });
            // Suite titles
            spyCalls.forEach(function (_a, index) {
                var actualTitle = _a.args[0];
                var expectedParams = expectedParamsList[index];
                var expectedTitle = getExpectedTitle(expectedParams);
                strictEqual(actualTitle, expectedTitle);
            });
            // Suite callback functions calls
            spyCalls.forEach(function (_a, index) {
                var _b = _a.args, actualSuiteCallback = _b[1];
                suiteCallbackSpy.resetHistory();
                var expectedThis = {};
                actualSuiteCallback.call(expectedThis);
                deepStrictEqual(suiteCallbackSpy.lastCall.thisValue, expectedThis);
                deepStrictEqual(suiteCallbackSpy.lastCall.args, expectedParamsList[index]);
            });
            // Return value
            deepStrictEqual(actualDescribeReturnValue, spyCalls.map(function (_a) {
                var returnValue = _a.returnValue;
                return returnValue;
            }));
        }
        function getTestParams() {
            var params = [
                'A',
                ebdd.only('B'),
                ebdd.skip('C'),
                ebdd.testIf(true, 'D'),
                ebdd.testIf(false, 'E'),
            ];
            return params;
        }
        var bddDescribe;
        var bddDescribeOnly;
        var bddDescribeSkip;
        var ebdd;
        beforeEach(function () {
            function newSuite() {
                var suite = new mocha$1.Suite('abc');
                return suite;
            }
            var sandbox = sinon.createSandbox();
            var describe = bddDescribe = sandbox.stub().callsFake(newSuite);
            bddDescribeOnly = describe.only = sandbox.stub().callsFake(newSuite);
            bddDescribeSkip = describe.skip = sandbox.stub().callsFake(newSuite);
            var context = { describe: describe };
            createInterface(context);
            ebdd = context;
        });
        after(function () {
            var _a;
            (_a = {}, bddDescribe = _a.bddDescribe, bddDescribeOnly = _a.bddDescribeOnly, bddDescribeSkip = _a.bddDescribeSkip, ebdd = _a.ebdd);
        });
        it('describe', function () { return assertBDDDescribe(ebdd.describe, bddDescribe); });
        it('describe.only', function () { return assertBDDDescribe(ebdd.describe.only, bddDescribeOnly); });
        it('describe.only.only', function () { return throws(function () { return void ebdd.describe.only.only; }, Error); });
        it('describe.only.skip', function () { return throws(function () { return void ebdd.describe.only.skip; }, Error); });
        it('describe.only.if(true)', function () { return assertBDDDescribe(ebdd.describe.only.if(true), bddDescribeOnly); });
        it('describe.only.if(false)', function () { return assertBDDDescribe(ebdd.describe.only.if(false), bddDescribeSkip); });
        it('describe.only.per([...])', function () {
            var ebddDescribeAny = ebdd.describe.only.per(getTestParams());
            var bddDescribeAny = [
                bddDescribeOnly,
                bddDescribeOnly,
                bddDescribeSkip,
                bddDescribeOnly,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
        });
        it('describe.skip', function () { return assertBDDDescribe(ebdd.describe.skip, bddDescribeSkip); });
        it('describe.skip.only', function () { return throws(function () { return void ebdd.describe.skip.only; }, Error); });
        it('describe.skip.skip', function () { return throws(function () { return void ebdd.describe.skip.skip; }, Error); });
        it('describe.skip.if(true)', function () { return assertBDDDescribe(ebdd.describe.skip.if(true), bddDescribeSkip); });
        it('describe.skip.if(false)', function () { return assertBDDDescribe(ebdd.describe.skip.if(false), bddDescribeSkip); });
        it('describe.skip.per([...])', function () {
            var ebddDescribeAny = ebdd.describe.skip.per(getTestParams());
            var bddDescribeAny = [
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
        });
        it('describe.if(true)', function () { return assertBDDDescribe(ebdd.describe.if(true), bddDescribe); });
        it('describe.if(true).only', function () { return assertBDDDescribe(ebdd.describe.if(true).only, bddDescribeOnly); });
        it('describe.if(true).skip', function () { return assertBDDDescribe(ebdd.describe.if(true).skip, bddDescribeSkip); });
        it('describe.if(true).if(true)', function () { return assertBDDDescribe(ebdd.describe.if(true).if(true), bddDescribe); });
        it('describe.if(true).if(false)', function () { return assertBDDDescribe(ebdd.describe.if(true).if(false), bddDescribeSkip); });
        it('describe.if(true).per([...])', function () {
            var ebddDescribeAny = ebdd.describe.if(true).per(getTestParams());
            var bddDescribeAny = [bddDescribe, bddDescribeOnly, bddDescribeSkip, bddDescribe, bddDescribeSkip];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
        });
        it('describe.if(false)', function () { return assertBDDDescribe(ebdd.describe.if(false), bddDescribeSkip); });
        it('describe.if(false).only', function () { return assertBDDDescribe(ebdd.describe.if(false).only, bddDescribeSkip); });
        it('describe.if(false).skip', function () { return assertBDDDescribe(ebdd.describe.if(false).skip, bddDescribeSkip); });
        it('describe.if(false).if(true)', function () { return assertBDDDescribe(ebdd.describe.if(false).if(true), bddDescribeSkip); });
        it('describe.if(false).if(false)', function () { return assertBDDDescribe(ebdd.describe.if(false).if(false), bddDescribeSkip); });
        it('describe.if(false).per([...])', function () {
            var ebddDescribeAny = ebdd.describe.if(false).per(getTestParams());
            var bddDescribeAny = [
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
        });
        it('describe.per([...]).only', function () {
            var ebddDescribeAny = ebdd.describe.per(getTestParams()).only;
            var bddDescribeAny = [
                bddDescribeOnly,
                bddDescribeOnly,
                bddDescribeSkip,
                bddDescribeOnly,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
        });
        it('describe.per([...]).skip', function () {
            var ebddDescribeAny = ebdd.describe.per(getTestParams()).skip;
            var bddDescribeAny = [
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
        });
        it('describe.per([...]).if(true)', function () {
            var ebddDescribeAny = ebdd.describe.per(getTestParams()).if(true);
            var bddDescribeAny = [bddDescribe, bddDescribeOnly, bddDescribeSkip, bddDescribe, bddDescribeSkip];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
        });
        it('describe.per([...]).if(false)', function () {
            var ebddDescribeAny = ebdd.describe.per(getTestParams()).if(false);
            var bddDescribeAny = [
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
        });
        it('describe.per([...]).per([...])', function () {
            var ebddDescribeAny = ebdd.describe
                .per({ 0: 3, 1: ebdd.only(7), 2: ebdd.skip(11), length: 3 })
                .per(['potatoes', ebdd.only('tomatoes'), ebdd.skip('pizzas')]);
            var bddDescribeAny = [
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
            assertBDDDescribesWithParams(ebddDescribeAny, bddDescribeAny, '#1 #2', suiteCallback, function (_a) {
                var count = _a[0], food = _a[1];
                return count + " " + food;
            }, expectedParamsList);
        });
        it('context', function () { return strictEqual(ebdd.context, ebdd.describe); });
        it('xdescribe', function () { return assertBDDDescribe(ebdd.xdescribe, bddDescribeSkip); });
        it('xdescribe.only', function () { return throws(function () { return void ebdd.xdescribe.only; }, Error); });
        it('xdescribe.skip', function () { return throws(function () { return void ebdd.xdescribe.skip; }, Error); });
        it('xdescribe.if(true)', function () { return assertBDDDescribe(ebdd.xdescribe.if(true), bddDescribeSkip); });
        it('xdescribe.if(false)', function () { return assertBDDDescribe(ebdd.xdescribe.if(false), bddDescribeSkip); });
        it('xdescribe.per([...])', function () {
            var ebddDescribeAny = ebdd.xdescribe.per(getTestParams());
            var bddDescribeAny = [
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
                bddDescribeSkip,
            ];
            assertBDDDescribes(ebddDescribeAny, bddDescribeAny);
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

    var __spreadArrays$1 = (undefined && undefined.__spreadArrays) || function () {
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
                }, [['A'], ['B'], ['C'], ['D'], ['E']], []);
            }
            {
                var testCallback = function (letter, done) { };
                var done = function () { };
                assertBDDItsWithParams(ebddItAny, bddCallDataList, '"#" is good', testCallback, function (_a) {
                    var letter = _a[0];
                    return "\"" + letter + "\" is good";
                }, [['A'], ['B'], ['C'], ['D'], ['E']], [done]);
            }
        }
        function assertBDDItsWithParams(ebddItAny, bddCallDataList, titlePattern, testCallback, getExpectedTitle, expectedParamsList, extraArgs) {
            var testCallbackSpy = sinon.spy(testCallback);
            var actualItReturnValue = ebddItAny(titlePattern, testCallbackSpy);
            var uniqueBDDItAny = [];
            var spyCalls = bddCallDataList.map(function (bddCallData) {
                var it = bddCallData.it;
                if (uniqueBDDItAny.indexOf(it) < 0)
                    uniqueBDDItAny.push(it);
                var nextCallIndex = it.nextCallIndex || 0;
                it.nextCallIndex = nextCallIndex + 1;
                var spyCall = it.getCall(nextCallIndex);
                return spyCall;
            });
            // it callback order
            spyCalls.reduce(function (previousSpyCall, currentSpyCall) {
                ok(currentSpyCall.calledImmediatelyAfter(previousSpyCall));
                return currentSpyCall;
            });
            // it callback counts
            uniqueBDDItAny.forEach(function (it) {
                strictEqual(it.callCount, it.nextCallIndex);
            });
            // Test titles
            spyCalls.forEach(function (_a, index) {
                var actualTitle = _a.args[0];
                var expectedParams = expectedParamsList[index];
                var expectedTitle = getExpectedTitle(expectedParams);
                strictEqual(actualTitle, expectedTitle);
            });
            // Test callback functions calls
            spyCalls.forEach(function (_a, index) {
                var _b = _a.args, actualTestCallback = _b[1];
                deepStrictEqual(typeof actualTestCallback, bddCallDataList[index].useFn ? 'function' : 'undefined');
                if (actualTestCallback) {
                    testCallbackSpy.resetHistory();
                    var expectedThis = {};
                    actualTestCallback.call.apply(actualTestCallback, __spreadArrays$1([expectedThis], extraArgs));
                    deepStrictEqual(testCallbackSpy.lastCall.thisValue, expectedThis);
                    deepStrictEqual(testCallbackSpy.lastCall.args, __spreadArrays$1(expectedParamsList[index], extraArgs));
                }
            });
            // Return value
            deepStrictEqual(actualItReturnValue, spyCalls.map(function (_a) {
                var returnValue = _a.returnValue;
                return returnValue;
            }));
        }
        function getTestParams() {
            var params = [
                'A',
                ebdd.only('B'),
                ebdd.skip('C'),
                ebdd.testIf(true, 'D'),
                ebdd.testIf(false, 'E'),
            ];
            return params;
        }
        var bddIt;
        var bddItOnly;
        var bddItSkip;
        var ebdd;
        beforeEach(function () {
            function newTest() {
                var test = new mocha$1.Test('abc');
                return test;
            }
            var sandbox = sinon.createSandbox();
            var it = sandbox.stub().callsFake(newTest);
            bddIt = { it: it, useFn: true };
            bddItSkip = { it: it, useFn: false };
            it.only = sandbox.stub().callsFake(newTest);
            bddItOnly = { it: it.only, useFn: true };
            var context = { it: it };
            createInterface(context);
            ebdd = context;
        });
        after(function () {
            var _a;
            (_a = {}, bddIt = _a.bddIt, bddItOnly = _a.bddItOnly, bddItSkip = _a.bddItSkip, ebdd = _a.ebdd);
        });
        it('it', function () { return assertBDDIt(ebdd.it, bddIt); });
        it('it.only', function () { return assertBDDIt(ebdd.it.only, bddItOnly); });
        it('it.only.only', function () { return throws(function () { return void ebdd.it.only.only; }, Error); });
        it('it.only.skip', function () { return throws(function () { return void ebdd.it.only.skip; }, Error); });
        it('it.only.if(true)', function () { return assertBDDIt(ebdd.it.only.if(true), bddItOnly); });
        it('it.only.if(false)', function () { return assertBDDIt(ebdd.it.only.if(false), bddItSkip); });
        it('it.only.per([...])', function () {
            var ebddItAny = ebdd.it.only.per(getTestParams());
            var bddCallDataList = [bddItOnly, bddItOnly, bddItSkip, bddItOnly, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.skip', function () { return assertBDDIt(ebdd.it.skip, bddItSkip); });
        it('it.skip.only', function () { return throws(function () { return void ebdd.it.skip.only; }, Error); });
        it('it.skip.skip', function () { return throws(function () { return void ebdd.it.skip.skip; }, Error); });
        it('it.skip.if(true)', function () { return assertBDDIt(ebdd.it.skip.if(true), bddItSkip); });
        it('it.skip.if(false)', function () { return assertBDDIt(ebdd.it.skip.if(false), bddItSkip); });
        it('it.skip.per([...])', function () {
            var ebddItAny = ebdd.it.skip.per(getTestParams());
            var bddCallDataList = [bddItSkip, bddItSkip, bddItSkip, bddItSkip, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.if(true)', function () { return assertBDDIt(ebdd.it.if(true), bddIt); });
        it('it.if(true).only', function () { return assertBDDIt(ebdd.it.if(true).only, bddItOnly); });
        it('it.if(true).skip', function () { return assertBDDIt(ebdd.it.if(true).skip, bddItSkip); });
        it('it.if(true).if(true)', function () { return assertBDDIt(ebdd.it.if(true).if(true), bddIt); });
        it('it.if(true).if(false)', function () { return assertBDDIt(ebdd.it.if(true).if(false), bddItSkip); });
        it('it.if(true).per([...])', function () {
            var ebddItAny = ebdd.it.if(true).per(getTestParams());
            var bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.if(false)', function () { return assertBDDIt(ebdd.it.if(false), bddItSkip); });
        it('it.if(false).only', function () { return assertBDDIt(ebdd.it.if(false).only, bddItSkip); });
        it('it.if(false).skip', function () { return assertBDDIt(ebdd.it.if(false).skip, bddItSkip); });
        it('it.if(false).if(true)', function () { return assertBDDIt(ebdd.it.if(false).if(true), bddItSkip); });
        it('it.if(false).if(false)', function () { return assertBDDIt(ebdd.it.if(false).if(false), bddItSkip); });
        it('it.if(false).per([...])', function () {
            var ebddItAny = ebdd.it.if(false).per(getTestParams());
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
        it('it.per([...]).if(true)', function () {
            var ebddItAny = ebdd.it.per(getTestParams()).if(true);
            var bddCallDataList = [bddIt, bddItOnly, bddItSkip, bddIt, bddItSkip];
            assertBDDIts(ebddItAny, bddCallDataList);
        });
        it('it.per([...]).if(false)', function () {
            var ebddItAny = ebdd.it.per(getTestParams()).if(false);
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
            }, expectedParamsList, []);
        });
        it('specify', function () { return strictEqual(ebdd.specify, ebdd.it); });
        it('xit', function () { return assertBDDIt(ebdd.xit, bddItSkip); });
        it('xit.only', function () { return throws(function () { return void ebdd.xit.only; }, Error); });
        it('xit.skip', function () { return throws(function () { return void ebdd.xit.skip; }, Error); });
        it('xit.if(true)', function () { return assertBDDIt(ebdd.xit.if(true), bddItSkip); });
        it('xit.if(false)', function () { return assertBDDIt(ebdd.xit.if(false), bddItSkip); });
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

    describe('ebdd', function () {
        after(function () { return sinon.restore(); });
        it('sets up correctly', function () {
            var bdd = sinon.stub(mocha$1.interfaces, 'bdd');
            initEBDD({ interfaces: mocha$1.interfaces });
            var ebdd = mocha$1.interfaces.ebdd;
            var suite = new mocha$1.Suite('abc');
            ebdd(suite);
            ok(bdd.calledOnceWithExactly(suite));
            var listeners = suite.listeners('pre-require');
            deepStrictEqual(listeners, [createInterface]);
        });
    });

    describe('skip & only', function () {
        var only;
        var skip;
        var testIf;
        beforeEach(function () {
            var ebdd = {};
            createInterface(ebdd);
            (only = ebdd.only, skip = ebdd.skip);
        });
        after(function () {
            var ebdd = {};
            (only = ebdd.only, skip = ebdd.skip);
        });
        it('skip(skip(...))', function () { return throws(function () { return skip(skip({})); }); });
        it('skip(only(...))', function () { return throws(function () { return skip(only({})); }); });
        it('skip(testIf(true, ...))', function () { return throws(function () { return skip(testIf()); }); });
        it('skip(testIf(false, ...))', function () { return throws(function () { return skip(testIf()); }); });
        it('only(skip(...))', function () { return throws(function () { return only(skip({})); }); });
        it('only(only(...))', function () { return throws(function () { return only(only({})); }); });
        it('only(testIf(true, ...))', function () { return throws(function () { return only(testIf()); }); });
        it('only(testIf(false, ...))', function () { return throws(function () { return only(testIf()); }); });
        it('testIf(true, skip(...))', function () { return throws(function () { return testIf(); }); });
        it('testIf(true, only(...))', function () { return throws(function () { return testIf(); }); });
        it('testIf(true, testIf(true, ...))', function () { return throws(function () { return testIf(); }); });
        it('testIf(true, testIf(false, ...))', function () { return throws(function () { return testIf(); }); });
        it('testIf(false, skip(...))', function () { return throws(function () { return testIf(); }); });
        it('testIf(false, only(...))', function () { return throws(function () { return testIf(); }); });
        it('testIf(false, testIf(true, ...))', function () { return throws(function () { return testIf(); }); });
        it('testIf(false, testIf(false, ...))', function () { return throws(function () { return testIf(); }); });
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
