(function() {
    /** @inner */
    function mockCollection(collection, binding, callback) {
        if (JSMocka.isArray(collection)) {
            for (var i = 0, len = collection.length; i < len; i++) {
                callback.call(binding, collection[i]);
            }
        } else {
            for (var name in collection) {
                callback.call(binding, name).returns(collection[name]);
            }
        }
        return binding;
    }

    /** @inner */
    function mockify(method) {
        return function(object, attributes) {
            var mocked = new JSMocka(object || {}, attributes);
            if (attributes && typeof attributes !== 'function') {
                mocked[method](attributes);
            }
            return mocked;
        };
    }

    /** @inner */
    function onStubbing(object, method) {
        if (JSMocka.Configuration.shouldPrevent('StubbingNonExistentMethod', object)) {
            if (!(method in object)) {
                throw new Error('JSMocka::Expectation.Stubbing non existent method: ' + method);
            }
        }
        if (JSMocka.Configuration.shouldPrevent('StubbingNonPublicMethod', object)) {
            if ((/^_/).test(method)) {
                throw new Error('JSMocka::Expectation.Stubbing non public method: ' + method);
            }
        }
    }

    /** @inner */
    var expectations = [];

    /**
    * @constructor
    * @param object {Object|Function}
    * @param $block {function}
    */
    JSMocka = function(object, $block) {

        /**
        * @see JSMocka.Expectation
        */
        this.stubs = function(method) {
            if (JSMocka.isString(method)) {
                return this.expects(method).anyTime().setEvaluable(false);
            }
            return mockCollection(method, this, this.stubs);
        };

        /**
        * Adds an expectation that a method identified by method must be called
        * exactly once with any parameters. Returns the new expectation which can be
        * further modified by methods on JSMocka.Expectation.
        * @see JSMocka.Expectation
        */
        this.expects = function(method) {
            if (JSMocka.isString(method)) {
                onStubbing(object, method);
                var expectation  = new JSMocka.Expectation(object, method);
                expectation.apply();
                expectations.push(expectation);
                return expectation;
            }
            return mockCollection(method, this, this.expects);
        };

        this.anyInstance = function() {
            if (object.prototype) {
                object = object.prototype;
            }
            return this;
        };

        /**
        * TODO: description
        * @see JSMocka.Configuration
        */
        this.allow = function() {
            JSMocka.Configuration.allow(JSMocka.toArray(arguments), object);
            return this;
        };

        /**
        * TODO: description
        * @see JSMocka.Configuration
        */
        this.prevent = function() {
            JSMocka.Configuration.prevent(JSMocka.toArray(arguments), object);
            return this;
        };

        if (typeof $block === 'function') {
            var contents = $block.toString().match(/^[^\{]*\{((.*\n*)*)\}/m)[1];
            new Function('api', 'with (this) { ' + contents + ' }').call(this);
        }
    };

    /**
    * TODO: description
    */
    JSMocka.setup = function() {
        expectations = [];
    };

    /**
    * TODO: description
    * @param receiver {Object} an object which must respond to "fail {function}"
    */
    JSMocka.verify = function(receiver) {
        var expectation;
        for (var i = 0, len = expectations.length; i < len; i++) {
            expectation = expectations[i];
            if (expectation.isEvaluable()) {
                if (expectation.evaluate()) {
                    receiver.pass && receiver.pass();
                } else {
                    receiver.fail('Expectation ' + expectation.toString() + ' not satisfied. ' +
                    'Details: ' + expectation.details());
                }
            }
            expectation.restore();
        }
    };

    /**
    * Alias for new JSMocka({}).expects
    * @example
    * JSMocka.mock({}, 'foo');
    * @return {JSMocka}
    */
    JSMocka.mock = mockify('expects');

    /**
    * Alias for new JSMocka({}).stubs
    * @example
    * JSMocka.stub({}, 'foo');
    * @return {JSMocka}
    */
    JSMocka.stub = mockify('stubs');

    /** @inner */
    JSMocka.extend = function(extensions) {
        for (extension in extensions) {
            JSMocka[extension] = extensions[extension];
        }
    };
})();
/** @inner */
JSMocka.extend((function () {
    var Class = function() {};
    Class.create = function(constructor) {
        var k = this;
        var c = function() {
            this._super = k;
            var pubs = constructor.apply(this, arguments), self = this;
            for (key in pubs) (function(fn, sfn) {
                self[key] = typeof fn != 'function' || typeof sfn != 'function' ? fn :
                function() { this._super = sfn; return fn.apply(this, arguments); };
            })(pubs[key], self[key]);
        };
        c.prototype = new this;
        c.prototype.constructor = c;
        c.extend = this.extend || this.create;
        return c;
    };

    var getClass = (function (toString) {
        return function (object) {
            return toString.call(object).slice(8, -1);
        };
    })(Object.prototype.toString);

    return {
        Class: Class,

        isString: function(object) {
            return getClass(object) === "String";
        },

        isArray: function(object) {
            return getClass(object) === "Array";
        },

        isObject: function(object) {
            return object !== null && getClass(object) === "Object";
        },

        toArray: (function (slice) {
            return function (args) {
                return slice.call(args || []);
            };
        })(Array.prototype.slice),

        hasKey: function(key, object) {
            return JSMocka.isObject(object) && key in object;
        },

        inspect: function(object) {
            if (object === null) {
                return 'null';
            }
            if ((/string|number|boolean|undefined/i).test(typeof object)) {
                return object + '';
            }
            if (JSMocka.isArray(object)) {
                return '[' + JSMocka.collect(object, JSMocka.inspect).join(', ') + ']';
            }
            if (JSMocka.isObject(object)) {
                return '{ ' + JSMocka.collect(object, function(value, key) {
                    return key + ': ' + value;
                }).join(', ') + ' }';
            }
            return object.constructor || object.prototype.constructor;
        },

        collect: function(object, callback) {
            var collection = [];
            if (JSMocka.isArray(object)) {
                for (var i = 0, len = object.length; i < len; i++) {
                    collection.push(callback(object[i]));
                }
            } else {
                for (var key in object) {
                    collection.push(callback(object[key], key, object));
                }
            }
            return collection;
        }
    };
})());
(function () {
    var FLAGS = { Prevent: 0, Allow: 1, Warn: 2 },
    DEFAULTS = { StubbingNonExistentMethod: FLAGS.Allow, StubbingNonPublicMethod: FLAGS.Prevent },
    configurations = [],
    global = {};

    function get(rule, object) {
        var configuration;
        for (var i = 0, len = configurations.length; i < len; i++) {
            configuration = configurations[i];
            if (configuration.object === object && rule in configuration.rules) {
                return configuration.rules[rule];
            }
        }
        return DEFAULTS[rule];
    }

    function set(actions, object, flag) {
        if (JSMocka.isArray(actions)) {
            var rules = {}, len = actions.length;
            for (var i = 0; i < len; i++) {
                rules[actions[i]] = flag;
            }
            configurations.push({ object: object || global, rules: rules });
        }
    }

    /**
    * @namespace
    */
    JSMocka.Configuration = {
        allow: function(actions, object) {
            set(actions, object, FLAGS.Allow);
        },

        prevent: function(actions, object) {
            set(actions, object, FLAGS.Prevent);
        },

        warn: function(actions, object) {
            set(actions, object, FLAGS.Warn);
        },

        /** @inner */
        shouldAllow: function(rule, object) {
            return get(rule, object) === FLAGS.Allow;
        },

        /** @inner */
        shouldPrevent: function(rule, object) {
            return get(rule, object) === FLAGS.Prevent;
        },

        /** @inner */
        shouldWarn: function(rule, object) {
            return get(rule, object) === FLAGS.Warn;
        }
    };
})();
/**
* @namespace
* @description
* If you integrate JSMocka into a test framework e.g. Screw, every matcher
* is automaticaly available without namespacing it.
* @example
* "JSMocka.Matcher.Nothing" is aliased to "Nothing"
*/
JSMocka.Matcher = {
    /**
    * Parameter matcher that matches any parameters, even none at all.
    */
    AnyParameters: function() {
        return new JSMocka.Matcher.AnyParametersMatcher();
    },

    /**
    * Parameter matcher that matches any parameters, even none at all.
    * @param {*} a variable argument list of expected arguments
    */
    AnyOf: function() {
        return new JSMocka.Matcher.AnyOfParameterMatcher(JSMocka.toArray(arguments));
    },

    /**
    * Parameter matcher that matches any parameters, even none at all.
    * @param {*} a variable argument list of expected arguments
    */
    AllOf: function() {
        return new JSMocka.Matcher.AllOfParameterMatcher(JSMocka.toArray(arguments));
    },

    /**
    * Parameter matcher that matches if no parameters are given.
    */
    Nothing: function() {
        return new JSMocka.Matcher.NoParametersMatcher();
    },

    /**
    * Parameter matcher that matches one exactly specified parameter.
    * @param arg {*} the expected argument
    */
    Exactly: function(arg) {
        return new JSMocka.Matcher.ExactParameterMatcher(arg);
    },

    /**
    * Parameter matcher that matches any one parameter. Alias for Anything().
    */
    AnyParameter: function() {
        return new JSMocka.Matcher.AnyParameterMatcher();
    },

    /**
    * Parameter matcher that matches any one parameter. Alias for AnyParameter().
    */
    Anything: function() {
        return JSMocka.Matcher.AnyParameter();
    },

    /**
    * Parameter matcher that matches a hash parameter having the specified keys and
    * values.
    * @example
    * var o = {};
    * JSMocka.mock(o, 'foo').withArgs(JSMocka.Matcher.Having({ a: 1 }));
    * a.foo({ a: 1 }); // succeeds
    * a.foo({ a: 1, b: 2 }); // succeeds
    * a.foo({ b: 2 }); // fails
    *
    * @param hash {object} the expected hash object
    */
    Having: function(hash) {
        return new JSMocka.Matcher.HavingMatcher(hash);
    },

    /**
    * Parameter matcher that matches a hash parameter having the specified key.
    * @example
    * var o = {};
    * JSMocka.mock(o, 'foo').withArgs(JSMocka.Matcher.HavingKey('a'));
    * a.foo({ a: 1 }); // succeeds
    * a.foo({ a: 1, b: 2 }); // succeeds
    * a.foo({ b: 2 }); // fails
    *
    * @param key {string} the expected key
    */
    HavingKey: function(key) {
        return new JSMocka.Matcher.HavingKeyMatcher(key);
    },

    /**
    * Parameter matcher that matches a hash parameter having the specified value.
    * @example
    * var o = {};
    * JSMocka.mock(o, 'foo').withArgs(JSMocka.Matcher.HavingValue(1));
    * a.foo({ a: 1 }); // succeeds
    * a.foo({ a: 1, b: 2 }); // succeeds
    * a.foo({ b: 2 }); // fails
    *
    * @param value {*} the expected value
    */
    HavingValue: function(value) {
        return new JSMocka.Matcher.HavingValueMatcher(value);
    },

    /**
    * Parameter matcher that matches any parameter that is an instance of class
    * clazz.
    * @param clazz {Function} the expected class
    */
    InstanceOf: function(clazz) {
        return new JSMocka.Matcher.InstanceOfMatcher(clazz);
    },

    /**
    * Parameter matcher that matches the elements of an array parameter against
    * another parameter matcher.
    * @example
    * var o = {};
    * JSMocka.mock(o, 'foo').withArgs(JSMocka.Matcher.Includes(1));
    * a.foo([1]); // succeeds
    * a.foo([1, 2, 3]); // succeeds
    * a.foo([2, 3]); // fails
    *
    * @param matcher {*} the expected value
    */
    Includes: function(matcher) {
        return new JSMocka.Matcher.IncludesParameterMatcher(matcher);
    },

    /**
    * Parameter matcher that matches a string parameter against a specified
    * regular expression.
    * @example
    * var o = {};
    * JSMocka.mock(o, 'foo').withArgs(JSMocka.Matcher.SomethingLike(/hello/));
    * a.foo('hello world'); // succeeds
    * a.foo('good bye world'); // fails
    *
    * @param expression {RegExp} the regular expression to match against
    */
    SomethingLike: function(expression) {
        return new JSMocka.Matcher.RegexpParameterMatcher(expression);
    },

    /**
    * Parameter matcher that matches an object parameter that responds to method,
    * optionally returing return.
    * @example
    * var o = {};
    * JSMocka.mock(o, 'foo').withArgs(JSMocka.Matcher.RespondsWith('bar'));
    * a.foo({ bar: function() { return 1; } }); // succeeds
    * a.foo({}); // fails
    *
    * var o = {};
    * JSMocka.mock(o, 'foo').withArgs(JSMocka.Matcher.RespondsWith('bar', 1));
    * a.foo({ bar: function() { return 1; } }); // succeeds
    * a.foo({ bar: function() { return 2; } }); // fails
    * a.foo({}); // fails
    *
    * @param method {string} the method the arguments should respond to
    * @param returnValue {*} [returnValue = null] optionally returing value
    */
    RespondsWith: function(method, returnValue) {
        return new JSMocka.Matcher.RespondsWithParameterMatcher(method, returnValue);
    },

    /**
    * Parameter matcher that matches if the child parameter matcher doesn't match.
    */
    Not: function(matcher) {
        return new JSMocka.Matcher.NotParameterMatcher(matcher);
    }
};

/** @inner */
JSMocka.Matcher.ParametersMatcher = JSMocka.Class.create(function(args) {
    var expectedArgs = JSMocka.toArray(args);

    return {
        match: function(args) {
            var array = [].concat(args),
            result = true,
            matchers = this.matchers();
            for (var i = 0, len = matchers.length; i < len; i++) {
                if (!matchers[i].match(array)) {
                    result = false;
                    break;
                }
            }
            return result && array.length === 0;
        },

        matchers: function() {
            var matchers = [];
            for (var i = 0, len = expectedArgs.length; i < len; i++) {
                matchers.push(this.toMatcher(expectedArgs[i]));
            }
            return matchers;
        },

        toMatcher: function(thing) {
            if (JSMocka.hasKey('match', thing)) {
                return thing;
            } else {
                return new JSMocka.Matcher.ExactParameterMatcher(thing);
            }
        },

        toString: function() {
            var matchers = this.matchers(), result = [];
            for (var i = 0, len = matchers.length; i < len; i++) {
                result.push(matchers[i].toString());
            }
            return result.join(', ');
        }
    };
});

/** @inner */
JSMocka.Matcher.ParameterMatcher = JSMocka.Class.create(function() {
    return {
        match: function(args) {
            throw('Not Implemented');
        },

        toMatcher: function(thing) {
            if (JSMocka.hasKey('match', thing)) {
                return thing;
            } else {
                return new JSMocka.Matcher.ExactParameterMatcher(thing);
            }
        }
    };
});

/** @inner */
JSMocka.Matcher.AnyParametersMatcher = JSMocka.Matcher.ParametersMatcher.extend(function() {
    return {
        match: function(args) {
            for (var i = 0, len = args.length; i < len; i++) {
                args.pop();
            }
            return true;
        },

        toString: function() {
            return 'any parameters';
        }
    };
});

/** @inner */
JSMocka.Matcher.CompositeParameterMatcher = JSMocka.Matcher.ParameterMatcher.extend(function(children) {
    return {
        matchers: function() {
            var matchers = [];
            for (var i = 0, len = children.length; i < len; i++) {
                matchers.push(this.toMatcher(children[i]));
            }
            return matchers;
        }
    };
});

/** @inner */
JSMocka.Matcher.AnyOfParameterMatcher = JSMocka.Matcher.CompositeParameterMatcher.extend(function(children) {
    this._super(children);

    return {
        match: function(args) {
            var arg = args.shift(), matchers = this.matchers();
            for (var i = 0, len = matchers.length; i < len; i++) {
                if (matchers[i].match([arg])) {
                    return true;
                }
            }
            return false;
        },

        toString: function() {
            var matchers = this.matchers(), result = [];
            for (var i = 0, len = matchers.length; i < len; i++) {
                result.push(matchers[i].toString());
            }
            return 'any of (' + result.join(', ') + ')';
        }
    };
});

/** @inner */
JSMocka.Matcher.AllOfParameterMatcher = JSMocka.Matcher.CompositeParameterMatcher.extend(function(children) {
    this._super(children);

    return {
        match: function(args) {
            var arg = args.shift(), matchers = this.matchers();
            for (var i = 0, len = matchers.length; i < len; i++) {
                if (!matchers[i].match([arg])) {
                    return false;
                }
            }
            return true;
        },

        toString: function() {
            var matchers = this.matchers(), result = [];
            for (var i = 0, len = matchers.length; i < len; i++) {
                result.push(matchers[i].toString());
            }
            return 'all of (' + result.join(', ') + ')';
        }
    };
});

/** @inner */
JSMocka.Matcher.NoParametersMatcher = JSMocka.Matcher.ParameterMatcher.extend(function() {
    return {
        match: function(args) {
            return args.length === 0;
        },

        toString: function() {
            return 'no parameters';
        }
    };
});

/** @inner */
JSMocka.Matcher.ExactParameterMatcher = JSMocka.Matcher.ParameterMatcher.extend(function(expected) {
    return {
        match: function(args) {
            return args.shift() == expected;
        },

        toString: function() {
            return JSMocka.inspect(expected);
        }
    };
});

/** @inner */
JSMocka.Matcher.AnyParameterMatcher = JSMocka.Matcher.ParameterMatcher.extend(function() {
    return {
        match: function(args) {
            return args.shift() !== undefined;
        },

        toString: function() {
            return 'any parameter';
        }
    };
});

/** @inner */
JSMocka.Matcher.HavingMatcher = JSMocka.Matcher.ParameterMatcher.extend(function(hash) {
    return {
        match: function(args) {
            var arg = args.shift();
            for (var key in hash) {
                if (arg[key] == hash[key]) {
                    return true;
                }
            }
            return false;
        },

        toString: function() {
            return '[hash containing ' + JSMocka.inspect(hash) + ']';
        }
    };
});

/** @inner */
JSMocka.Matcher.HavingKeyMatcher = JSMocka.Matcher.ParameterMatcher.extend(function(matcher) {
    matcher = this.toMatcher(matcher);
    return {
        match: function(args) {
            var arg = args.shift();
            for (var key in arg) {
                if (matcher.match([key])) {
                    return true;
                }
            }
            return false;
        },

        toString: function() {
            return '[hash with key ' + matcher.toString() + ']';
        }
    };
});

/** @inner */
JSMocka.Matcher.HavingValueMatcher = JSMocka.Matcher.ParameterMatcher.extend(function(matcher) {
    matcher = this.toMatcher(matcher);
    return {
        match: function(args) {
            var arg = args.shift();
            for (var key in arg) {
                if (matcher.match([arg[key]])) {
                    return true;
                }
            }
            return false;
        },

        toString: function() {
            return '[hash with value ' + matcher.toString() + ']';
        }
    };
});

/** @inner */
JSMocka.Matcher.InstanceOfMatcher = JSMocka.Matcher.ParameterMatcher.extend(function(clazz) {
    return {
        match: function(args) {
            return args.shift() instanceof clazz;
        },

        toString: function() {
            return '[instanceof ' + inspect(clazz) + ']';
        }
    };
});

/** @inner */
JSMocka.Matcher.IncludesParameterMatcher = JSMocka.Matcher.ParameterMatcher.extend(function(matcher) {
    matcher = this.toMatcher(matcher);
    return {
        match: function(args) {
            var arg = args.shift();
            if (JSMocka.isArray(arg)) {
                for (var i = 0, len = arg.length; i < len; i++) {
                    if (matcher.match([arg[i]])) {
                        return true;
                    }
                }
            }
            return false;
        },

        toString: function() {
            return '[including ' + matcher.toString() + ']';
        }
    };
});

/** @inner */
JSMocka.Matcher.RegexpParameterMatcher = JSMocka.Matcher.ParameterMatcher.extend(function(regexp) {
    return {
        match: function(args) {
            return regexp.test(args.shift());
        },

        toString: function() {
            return 'regexp ' + JSMocka.inspect(regexp);
        }
    };
});

/** @inner */
JSMocka.Matcher.RespondsWithParameterMatcher = JSMocka.Matcher.ParameterMatcher.extend(function(method, returnValue) {
    return {
        match: function(args) {
            var obj = args.shift();
            if (returnValue === undefined) {
                return obj[method];
            } else {
                return obj[method] && obj[method]();
            }
        },

        toString: function() {
            var string = 'responds with "' + method + '"';
            if (returnValue !== undefined) {
                string += ' returning ' + JSMocka.inspect(returnValue);
            }
            return string;
        }
    };
});

/** @inner */
JSMocka.Matcher.NotParameterMatcher = JSMocka.Matcher.ParameterMatcher.extend(function(matcher) {
    matcher = this.toMatcher(matcher);
    return {
        match: function(args) {
            return !matcher.match(args);
        },

        toString: function() {
            return 'not ' + matcher;
        }
    };
});

/** @inner */
JSMocka.Matcher.AnyCardinalityMatcher = JSMocka.Class.create(function() {
    return {
        match: function(times) {
            return true;
        },
        toString: function() {
            return 'zero or more times';
        }
    };
});

/** @inner */
JSMocka.Matcher.ExactCardinalityMatcher = JSMocka.Class.create(function(cardinality) {
    return {
        match: function(times) {
            return times == cardinality;
        },

        toString: function() {
            return 'exactly ' + cardinality + ' times';
        }
    };
});

/** @inner */
JSMocka.Matcher.RangeCardinalityMatcher = JSMocka.Class.create(function(from, to) {
    return {
        match: function(times) {
            return from <= times && times <= to;
        },

        toString: function() {
            return 'between ' + from + ' and ' + to + ' times';
        }
    };
});

/** @inner */
JSMocka.Matcher.MinimumCardinalityMatcher = JSMocka.Class.create(function(cardinality) {
    return {
        match: function(times) {
            return times >= cardinality;
        },

        toString: function() {
            return 'at least ' + cardinality + ' times';
        }
    };
});

/** @inner */
JSMocka.Matcher.MaximumCardinalityMatcher = JSMocka.Class.create(function(cardinality) {
    return {
        match: function(times) {
            return times <= cardinality;
        },

        toString: function() {
            return 'at most ' + cardinality + ' times';
        }
    };
});

/**
* Expectation
* @constructor
* @param object {Object} the object to define an expectation on
* @param method {String} the expected method
*/
JSMocka.Expectation = function(object, method) {

    var original = null,
        parametersMatcher = new JSMocka.Matcher.ParametersMatcher([new JSMocka.Matcher.AnyParametersMatcher()]),
        cardinalityMatcher = new JSMocka.Matcher.ExactCardinalityMatcher(1),
        correctCardinality,
        correctParameters = true,
        timesCalled = 0,
        callArguments = [],
        returnValues = [],
        negated = false,
        evaluable = true,
        patched = false;

    /**
    * @inner
    * Method that simulates the expected behaviour. It matches the expected
    * parameters, increments the call counter and returns the expected return
    * value.
    */
    function call() {
        var args = JSMocka.toArray(arguments);
        callArguments = callArguments.concat(args);
        correctParameters = correctParameters && parametersMatcher.match(args);
        timesCalled++;
        return returnValues.length > 1 ? returnValues.shift() : returnValues[0];
    }

    /**
    * @inner
    * Moves the original expected method away and replaces it with a method
    * showing the expected behaviour.
    * This method is automatically called.
    */
    this.apply = function() {
        if (!patched) {
            original = object[method];
            object[method] = call;
            patched = true;
        }
    };

    /**
    * @inner
    * Restores the original expected method. This method is automatically called
    * on verify.
    */
    this.restore = function() {
        if (patched) {
            object[method] = original;
            original = null;
        }
    };

    /**
    * @inner
    * Evaluates if the expectations have been met.
    */
    this.evaluate = function() {
        correctCardinality = cardinalityMatcher.match(timesCalled);
        var satisfied = correctParameters && correctCardinality;
        return negated ? !satisfied : satisfied;
    };

    /**
    * @inner
    * Provides a short description of the expectation.
    */
    this.toString = function() {
        var string = (negated ? "NOT " : "") + "Call of method '" + method;
        string += "' with " + parametersMatcher.toString();
        string += ", " + cardinalityMatcher.toString();
        var returnString = JSMocka.collect(returnValues, function(v) {return JSMocka.inspect(v);}).join(', then ');
        if (returnString.length > 0) {
            string += ", returning " + returnString;
        }
        return string;
    };

    /**
    * @inner
    * Provides a detailled description of the expectation, including which
    * expectations have been satisfied, and which have not.
    */
    this.details = function() {
        var string = 'Parameters were' + (correctParameters ? '' : ' NOT') + ' correctly matched. ';
        string += 'Expected number of calls was' + (correctCardinality ? '' : ' NOT') + ' matched. ';
        string += timesCalled + ' times called';
        if (callArguments.length > 0) {
            string += ', with ' +
            JSMocka.collect(callArguments, function(args) {return JSMocka.inspect(args);}).join('; ');
        }
        if (negated) {
            string += ' NOTE! This expectation was negated.';
        }
        return string;
    };

    /**
    * Modifies the expectation so that the expected method must be called with
    * the supplied parameters.
    * @example
    * var o = {};
    * JSMocka.mock(o, 'foo').withArgs('bar');
    * o.foo('bar); //succeeds
    * o.foo(); //fails
    * o.foo(1); //fails
    *
    * var o = {};
    * JSMocka.mock(o, 'foo').withArgs(JSMocka.Matcher.InstanceOf(Foo));
    *
    * @param args {string|object|array|number|boolean} Parameter matchers may be supplied as arguments.
    * @returns {JSMocka.Expectation} the object itself for chaining
    * @see JSMocka.Matcher
    */
    this.withArgs = function(args) {
        parametersMatcher = new JSMocka.Matcher.ParametersMatcher(arguments);
        return this;
    };

    /**
    * Syntactic sugar for complex expectations. Actually does nothing.
    * @returns {JSMocka.Expectation} the object itself for chaining
    */
    this.then = function() {
        return this;
    };

    /**
    * Modifies the expectation so that the expected method must be called the
    * specified amount of times.
    * @example
    * JSMocka.create({}).expects('foo').times(3);
    * @param card {number} the expected number of calls
    * @returns {JSMocka.Expectation} the object itself for chaining
    */
    this.times = function(card) {
        cardinalityMatcher = new JSMocka.Matcher.ExactCardinalityMatcher(card);
        return this;
    };

    /**
    * Modifies the expectation so that the expected method may be called any
    * amount of times.
    * @returns {JSMocka.Expectation} the object itself for chaining
    */
    this.anyTime = function() {
        cardinalityMatcher = new JSMocka.Matcher.AnyCardinalityMatcher();
        return this;
    };

    /**
    * Modifies the expectation so that the expected method must not be called at
    * all.
    * @returns {JSMocka.Expectation} the object itself for chaining
    */
    this.never = function() {
        return this.times(0);
    };

    /**
    * Modifies the expectation so that the expected method must be called exactly
    * once. This is the default setting.
    * @returns {JSMocka.Expectation} the object itself for chaining
    */
    this.once = function() {
        return this.times(1);
    };

    /**
    * Modifies the expectation so that the expected method must be called exactly
    * twice.
    * @returns {JSMocka.Expectation} the object itself for chaining
    */
    this.twice = function() {
        return this.times(2);
    };

    /**
    * Modifies the expectation so that the expected method must be called at
    * least the specified amount of times.
    * @param times {number} the min number number of expected calls
    * @returns {JSMocka.Expectation} the object itself for chaining
    */
    this.atLeast = function(times) {
        cardinalityMatcher = new JSMocka.Matcher.MinimumCardinalityMatcher(times);
        return this;
    };

    /**
    * Modifies the expectation so that the expected method must be called at
    * most the specified amount of times.
    * @param times {number} the max number number of expected calls
    * @returns {JSMocka.Expectation} the object itself for chaining
    */
    this.atMost = function(times) {
        cardinalityMatcher = new JSMocka.Matcher.MaximumCardinalityMatcher(times);
        return this;
    };

    /**
    * Modifies the expectation so that the expected method must be called any
    * amount of times in the interval specified by from and to.
    * @param from {number} the min number number of expected calls
    * @param to {number} the max number number of expected calls
    * @returns {JSMocka.Expectation} the object itself for chaining
    */
    this.between = function(from, to) {
        cardinalityMatcher = new JSMocka.Matcher.RangeCardinalityMatcher(from, to);
        return this;
    };

    /**
    * Negates the expectation, such that it the evaluation fails if all specified
    * criteria are met.
    * @example
    * // In the following example, no instance of class Foo may be created.
    *
    * var Foo = new function() {};
    * JSMocka.create(Foo).anyInstance().not();
    * @returns {JSMocka.Expectation} the object itself for chaining
    */
    this.not = function() {
        negated = true;
        return this;
    };

    /**
    * Modifies the expectation so that when the expected method is called, it
    * returns the specified value.
    *
    * This method may be called with multiple arguments, or multiple times. In
    * this case, the values are returned in turn on consecutive calls to the
    * method.
    * @example
    * var o = {};
    * m = JSMocka.create(o);
    * m.stubs('foo').returns(10, 12);
    * m.stubs('bar').returns(14).then().returns(16);
    *
    * @returns {JSMocka.Expectation} the object itself for chaining
    */
    this.returns = function() {
        returnValues = returnValues.concat(JSMocka.toArray(arguments));
        return this;
    };

    /**
    * @inner
    */
    this.isEvaluable = function() {
        return evaluable;
    };

    /**
    * @inner
    */
    this.setEvaluable = function(shouldEvaluate) {
        evaluable = shouldEvaluate;
        return this;
    };
};
(function () {

    /** @inner */
    function extend(src, target) {
        for (method in src) {
            target[method] = src[method];
        }
    }

    /** @inner */
    function integrateTo(target) {
        extend(JSMocka, target);
        extend(JSMocka.Matcher, target);
    }

    /**
    * @namespace
    */
    JSMocka.Integration = {

        /**
        * TODO: description
        */
        ScrewUnit: function() {
            integrateTo(Screw.Matchers);
            Screw.Unit(function() {
                before(function() {
                    JSMocka.setup();
                });

                after(function() {
                    JSMocka.verify({
                        fail: function(msg) { throw msg; }
                    });
                });
            });
        }
    };
})();
