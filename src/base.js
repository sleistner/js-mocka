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
			return object != null && getClass(object) === "Object";
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