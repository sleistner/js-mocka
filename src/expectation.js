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
