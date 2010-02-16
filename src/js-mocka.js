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

        if (!(this instanceof JSMocka)) {
            return new JSMocka(object, $block);
        }

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

        return this;
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
