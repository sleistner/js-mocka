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

