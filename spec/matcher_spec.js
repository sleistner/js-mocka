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

    describe('#Anything', function() {
      it('should match any parameter', function() {
        control.expects('foo').withArgs(Anything());
        object.foo('a');
      });

      it('should not match no argument given', function() {
        control.expects('foo').withArgs(Anything()).not();
        object.foo();
      });
    });

    describe('#AnyOf', function() {
      it('should match any matcher against parameter', function() {
        control.expects('foo').withArgs(AnyOf(1, 2));
        object.foo(2);
      });

      it('should not match given unexpected argument', function() {
        control.expects('foo').withArgs(AnyOf(1, 2)).not();
        object.foo(3);
      });
    });

    describe('#AllOf', function() {
      it('should match all matchers against parameter', function() {
        control.expects('foo').withArgs(AllOf(SomethingLike(/hello/), SomethingLike(/world/)));
        object.foo('hello world');
      });

      it('should not match given unsufficient arguments', function() {
        control.expects('foo').withArgs(AllOf(SomethingLike(/hello/), SomethingLike(/world/))).not();
        object.foo('hello');
      });
    });

    describe('#Includes', function() {
      it('should match array elements against matcher', function() {
        control.expects('foo').withArgs(Includes(1));
        object.foo([3, 5, 1, 2]);
      });

      it('should not match given unexpected argument', function() {
        control.expects('foo').withArgs(Includes(1)).not();
        object.foo([3]);
      });
    });

    describe('#Exactly', function() {
      it('should match exact parameter', function() {
        control.expects('foo').withArgs(Exactly('a'));
        object.foo('a');
      });

      it('should not match given unexpected argument', function() {
        control.expects('foo').withArgs(Exactly('a')).not();
        object.foo('b');
      });

      describe('omitting explicit matcher', function() {
        it('should match exact parameter', function() {
          control.expects('foo').withArgs('a');
          object.foo('a');
        });

        it('should not match given unexpected argument', function() {
          control.expects('foo').withArgs('a').not();
          object.foo('b');
        });
      });
    });

    describe('#InstanceOf', function() {
      it('should match instance of parameter', function() {
        control.expects('foo').withArgs(InstanceOf(Array));
        object.foo([1]);	
      });

      it('should not match given unexpected argument', function() {
        control.expects('foo').withArgs(InstanceOf(Array)).not();
        object.foo('bar');
      });
    });

    describe('#Having', function() {
      it('should match having parameter', function() {
        control.expects('foo').withArgs(Having({ a: 10 }));
        object.foo({ b: 13, a: 10 });
      });

      it('should not match given unexpected argument', function() {
        control.expects('foo').withArgs(Having({ a: 10 })).not();
        object.foo({ b: 13 });
      });
    });

    describe('#HavingKey', function() {
      it('should match having key in parameter', function() {
        control.expects('foo').withArgs(HavingKey('a'));
        object.foo({ 'b': 13, 'a': 10 });
      });

      it('should not match given unexpected argument', function() {
        control.expects('foo').withArgs(HavingKey('a')).not();
        object.foo({ 'c': 13, 'x': 10 });
      });
    });

    describe('#HavingValue', function() {
      it('should match having value in parameter', function() {
        control.expects('foo').withArgs(HavingValue(13));
        object.foo({ 'b': 13, 'a': 10 });
      });

      it('should not match given unexpected argument', function() {
        control.expects('foo').withArgs(HavingValue(13)).not();
        object.foo({ 'c': 11, 'x': 10 });
      });
    });

    describe('#SomethingLike', function() {
      it('should match regexp parameter', function() {
        control.expects('foo').withArgs(SomethingLike(/hello/));
        object.foo('hello world');	
      });

      it('should not match given unexpected argument', function() {
        control.expects('foo').withArgs(SomethingLike(/hello/)).not();
        object.foo('goodbye world');
      });
    });

    describe('#RespondsWith', function() {
      it('should match responding parameter', function() {
        control.expects('foo').withArgs(RespondsWith('bar'));
        object.foo({ bar: function() {} });
      });

      it('should not match given unexpected argument', function() {
        control.expects('foo').withArgs(RespondsWith('bar')).not();
        object.foo({});
      });

      describe('optional return value argument given', function() {
        it('should match responding parameter', function() {
          control.expects('foo').withArgs(RespondsWith('bar', 1));
          object.foo({ bar: function() { return 1; } });
        });

        it('should not match given unexpected argument', function() {
          control.expects('foo').withArgs(RespondsWith('bar', 1)).not();
          object.foo({});
        });
      });
    });

    describe('#Not', function() {
      it('should not match parameter', function() {
        control.expects('foo').withArgs(Not(SomethingLike(/goodbye/)));
        object.foo('hello world');
      });

      it('should not match given unexpected argument', function() {
        control.expects('foo').withArgs(Not(SomethingLike(/goodbye/))).not();
        object.foo('goodbye world');
      });
    });
  });
});