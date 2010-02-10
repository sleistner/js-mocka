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
