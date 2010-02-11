Screw.Unit(function() {
   
   describe('JSMocka.Expectation', function() {
       
       describe('#never', function() {
           it('should match no call', function() {
               control.expects('foo').never();
           });
           
           it('should not match if expectation is negated', function() {
                control.expects('foo').never().not();
                object.foo();
           });
       });
       
       describe('#once', function() {
           it('should match one call', function() {
               control.expects('foo').once();
               object.foo();
           });
           
           it('should not match if expectation is negated', function() {
               control.expects('foo').once().not();
           });
       });
       
       describe('#twice', function() {
           it('should match two calls', function() {
               control.expects('foo').twice();
               object.foo(1);
               object.foo(2);
           });
           
           it('should not match if expectation is negated', function() {
               control.expects('foo').twice().not();
               object.foo(1);
           });
       });

       describe('#times', function() {
           it('should match three calls', function() {
               control.expects('foo').times(3);
               object.foo(1);
               object.foo(2);
               object.foo(3);
           });
           
           it('should not match if expectation is negated', function() {
               control.expects('foo').times(3).not();
               object.foo(1);
           });
       });
       
       describe('#atLeast', function() {
           it('should match minimum calls', function() {
               control.expects('foo').atLeast(3);
               object.foo(1);
               object.foo(2);
               object.foo(3);
               object.foo(4);
           });
           
           it('should not match if expectation is negated', function() {
               control.expects('foo').atLeast(3).not();
               object.foo(1);
           });
       });
       
       describe('#atMost', function() {
           it('should match maximum calls', function() {
               control.expects('foo').atMost(3);
               object.foo(1);
               object.foo(2);
           });
           
           it('should not match if expectation is negated', function() {
               control.expects('foo').atMost(3).not();
               object.foo(1);
               object.foo(2);
               object.foo(3);
               object.foo(4);
           });
       });
       
       describe('#between', function() {
           it('should match range calls', function() {
               control.expects('foo').between(3, 5);
               object.foo(1);
               object.foo(2);
               object.foo(3);
               object.foo(4);
           });
           
           it('should not match if expectation is negated', function() {
               control.expects('foo').between(3, 5).not();
               object.foo(1);
           });  
       });

       describe('#anyTime', function() {
           it('should match any calls', function() {
               control.expects('foo').anyTime();
               object.foo(1);
               object.foo(2);
           });
           
           it('should not match if method is never called', function() {
               control.expects('foo').anyTime();
           });  
       });
       
       describe('#returns', function() {
           it('should return specified value', function() {
               control.expects('foo').returns(10);
               expect(object.foo()).to(equal, 10);
           });
           
           it('should return array value', function() {
               control.expects('foo').returns([10]);
               expect(object.foo()).to(equal, [10]);
           });

           it('should return different values on subsequent calls', function() {
               control.expects('foo').twice().returns(10, 12);
               expect(object.foo()).to(equal, 10);
               expect(object.foo()).to(equal, 12);
               
               control.expects('bar').twice().returns(13).then().returns(14);
               expect(object.bar()).to(equal, 13);
               expect(object.bar()).to(equal, 14);
           });
           
           it('should return array value on subsequent calls', function() {
               control.stubs('foo').returns([10]).then().returns([5]);
               expect(object.foo()).to(equal, [10]);
               expect(object.foo()).to(equal, [5]);
           });
       });
       
       it('should match arguments and cardinality', function() {
           control.expects('foo').withArgs('a').times(5);
           object.foo('a');
           object.foo('a');
           object.foo('a');
           object.foo('a');
           object.foo('a');
       });
   });
});