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