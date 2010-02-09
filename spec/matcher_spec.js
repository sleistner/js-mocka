Screw.Unit(function () {

	describe('JSMocka.Matcher', function() {
		var object, control, negate, negateControl;
		
		before(function() {
			object = {};
			control = new JSMocka(object);
			not = {};
			notControl = new JSMocka(not);
		});
		
		it('should negate expectation', function() {
            control.expects('foo').not();
        });
		
		it('should should match any parameters by default', function() {
			control.expects('foo');
            object.foo('a', 'b', 'c');
		});
		
		describe('#Nothing', function() {
			it('should match no parameters', function() {
				control.expects('foo').withArgs(Nothing());
                object.foo();
				notControl.expects('foo').withArgs(Nothing()).not();
                not.foo(1);
			});
		});
		
		describe('#AnyParameters', function() {
			it('should match any parameters', function() {
				control.expects('foo').withArgs(AnyParameters());
                object.foo('a', 'b', 'c');
			});
		});
		
	});
});