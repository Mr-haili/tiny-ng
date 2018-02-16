/*
 * copy from https://github.com/angular/angular.js/blob/master/test/ng/parseSpec.js
 * ~\(≧▽≦)/~
 */
// todo 这里路劲迟早要改的, 整个项目的文件结构有点乱
import { $parse } from '../src/main';
import { Scope } from '../src/main';

const scope: any = new Scope();

// 就是这么苟且
function inject(func: Function){
  return () => {
    return func(new Scope());    
  }
}

describe('$parse', function(){
  it('should parse expressions', function() {
    expect(scope.$eval('-1')).toEqual(-1);
    expect(scope.$eval('1 + 2.5')).toEqual(3.5);
    expect(scope.$eval('1 + -2.5')).toEqual(-1.5);
    expect(scope.$eval('1+2*3/4')).toEqual(1 + 2 * 3 / 4);
    expect(scope.$eval('0--1+1.5')).toEqual(0 - -1 + 1.5);
    expect(scope.$eval('-0--1++2*-3/-4')).toEqual(-0 - -1 + +2 * -3 / -4);
    expect(scope.$eval('1/2*3')).toEqual(1 / 2 * 3);
  });

  it('should parse unary', function() {
    expect(scope.$eval('+1')).toEqual(+1);
    expect(scope.$eval('-1')).toEqual(-1);
    expect(scope.$eval('+\'1\'')).toEqual(+'1');
    expect(scope.$eval('-\'1\'')).toEqual(-'1');

    expect(scope.$eval('+undefined')).toEqual(0);

    // Note: don't change toEqual to toBe as toBe collapses 0 & -0.
    expect(scope.$eval('-undefined')).toEqual(-0);

    // ts编译器不让过, 这里改一下
    // expect(scope.$eval('+null')).toEqual(+null);
    // expect(scope.$eval('-null')).toEqual(-null);
    expect(scope.$eval('+null')).toEqual(+0);
    expect(scope.$eval('-null')).toEqual(-0);
    expect(scope.$eval('+false')).toEqual(+false);
    expect(scope.$eval('-false')).toEqual(-false);
    expect(scope.$eval('+true')).toEqual(+true);
    expect(scope.$eval('-true')).toEqual(-true);
  });

  it('should parse comparison', function() {
    /* eslint-disable eqeqeq, no-self-compare */
    expect(scope.$eval('false')).toBeFalsy();
    expect(scope.$eval('!true')).toBeFalsy();
    expect(scope.$eval('1==1')).toBeTruthy();
    expect(scope.$eval('1==true')).toBeTruthy();
    expect(scope.$eval('1!=true')).toBeFalsy();
    expect(scope.$eval('1===1')).toBeTruthy();
    expect(scope.$eval('1===\'1\'')).toBeFalsy();
    expect(scope.$eval('1===true')).toBeFalsy();
    expect(scope.$eval('\'true\'===true')).toBeFalsy();
    expect(scope.$eval('1!==2')).toBeTruthy();
    expect(scope.$eval('1!==\'1\'')).toBeTruthy();
    expect(scope.$eval('1!=2')).toBeTruthy();
    expect(scope.$eval('1<2')).toBeTruthy();
    expect(scope.$eval('1<=1')).toBeTruthy();
    expect(scope.$eval('1>2')).toEqual(1 > 2);
    expect(scope.$eval('2>=1')).toEqual(2 >= 1);
    expect(scope.$eval('true==2<3')).toEqual(true == 2 < 3);
    expect(scope.$eval('true===2<3')).toEqual(true === 2 < 3);

    // expect(scope.$eval('true===3===3')).toEqual(true === 3 === 3);
    expect(scope.$eval('true===3===3')).toEqual(false);
    expect(scope.$eval('3===3===true')).toEqual(3 === 3 === true);
    // expect(scope.$eval('3 >= 3 > 2')).toEqual(3 >= 3 > 2);
    expect(scope.$eval('3 >= 3 > 2')).toEqual(false);

    /* eslint-enable */
  });

  it('should parse logical', function() {
    const scope: any = new Scope();
    expect(scope.$eval('0&&2')).toEqual(0 && 2);
    expect(scope.$eval('0||2')).toEqual(0 || 2);
    expect(scope.$eval('0||1&&2')).toEqual(0 || 1 && 2);
    expect(scope.$eval('true&&a')).toEqual(true && undefined);
    expect(scope.$eval('true&&a()')).toEqual(true && undefined);
    expect(scope.$eval('true&&a()()')).toEqual(true && undefined);
    expect(scope.$eval('true&&a.b')).toEqual(true && undefined);
    expect(scope.$eval('true&&a.b.c')).toEqual(true && undefined);
    expect(scope.$eval('false||a')).toEqual(false || undefined);
    expect(scope.$eval('false||a()')).toEqual(false || undefined);
    expect(scope.$eval('false||a()()')).toEqual(false || undefined);
    expect(scope.$eval('false||a.b')).toEqual(false || undefined);
    expect(scope.$eval('false||a.b.c')).toEqual(false || undefined);
  });

  it('should parse ternary', function() {
    const scope: any = new Scope();
    var returnTrue = scope.returnTrue = function() { return true; };
    var returnFalse = scope.returnFalse = function() { return false; };
    var returnString = scope.returnString = function() { return 'asd'; };
    var returnInt = scope.returnInt = function() { return 123; };
    var identity = scope.identity = function(x: any) { return x; };

    // Simple.
    expect(scope.$eval('0?0:2')).toEqual(0 ? 0 : 2);
    expect(scope.$eval('1?0:2')).toEqual(1 ? 0 : 2);

    // Nested on the left.
    expect(scope.$eval('0?0?0:0:2')).toEqual(0 ? 0 ? 0 : 0 : 2);
    expect(scope.$eval('1?0?0:0:2')).toEqual(1 ? 0 ? 0 : 0 : 2);
    expect(scope.$eval('0?1?0:0:2')).toEqual(0 ? 1 ? 0 : 0 : 2);
    expect(scope.$eval('0?0?1:0:2')).toEqual(0 ? 0 ? 1 : 0 : 2);
    expect(scope.$eval('0?0?0:2:3')).toEqual(0 ? 0 ? 0 : 2 : 3);
    expect(scope.$eval('1?1?0:0:2')).toEqual(1 ? 1 ? 0 : 0 : 2);
    expect(scope.$eval('1?1?1:0:2')).toEqual(1 ? 1 ? 1 : 0 : 2);
    expect(scope.$eval('1?1?1:2:3')).toEqual(1 ? 1 ? 1 : 2 : 3);
    expect(scope.$eval('1?1?1:2:3')).toEqual(1 ? 1 ? 1 : 2 : 3);

    // Nested on the right.
    expect(scope.$eval('0?0:0?0:2')).toEqual(0 ? 0 : 0 ? 0 : 2);
    expect(scope.$eval('1?0:0?0:2')).toEqual(1 ? 0 : 0 ? 0 : 2);
    expect(scope.$eval('0?1:0?0:2')).toEqual(0 ? 1 : 0 ? 0 : 2);
    expect(scope.$eval('0?0:1?0:2')).toEqual(0 ? 0 : 1 ? 0 : 2);
    expect(scope.$eval('0?0:0?2:3')).toEqual(0 ? 0 : 0 ? 2 : 3);
    expect(scope.$eval('1?1:0?0:2')).toEqual(1 ? 1 : 0 ? 0 : 2);
    expect(scope.$eval('1?1:1?0:2')).toEqual(1 ? 1 : 1 ? 0 : 2);
    expect(scope.$eval('1?1:1?2:3')).toEqual(1 ? 1 : 1 ? 2 : 3);
    expect(scope.$eval('1?1:1?2:3')).toEqual(1 ? 1 : 1 ? 2 : 3);

    // Precedence with respect to logical operators.
    expect(scope.$eval('0&&1?0:1')).toEqual(0 && 1 ? 0 : 1);
    expect(scope.$eval('1||0?0:0')).toEqual(1 || 0 ? 0 : 0);

    expect(scope.$eval('0?0&&1:2')).toEqual(0 ? 0 && 1 : 2);
    expect(scope.$eval('0?1&&1:2')).toEqual(0 ? 1 && 1 : 2);
    expect(scope.$eval('0?0||0:1')).toEqual(0 ? 0 || 0 : 1);
    expect(scope.$eval('0?0||1:2')).toEqual(0 ? 0 || 1 : 2);

    expect(scope.$eval('1?0&&1:2')).toEqual(1 ? 0 && 1 : 2);
    expect(scope.$eval('1?1&&1:2')).toEqual(1 ? 1 && 1 : 2);
    expect(scope.$eval('1?0||0:1')).toEqual(1 ? 0 || 0 : 1);
    expect(scope.$eval('1?0||1:2')).toEqual(1 ? 0 || 1 : 2);

    expect(scope.$eval('0?1:0&&1')).toEqual(0 ? 1 : 0 && 1);
    expect(scope.$eval('0?2:1&&1')).toEqual(0 ? 2 : 1 && 1);
    expect(scope.$eval('0?1:0||0')).toEqual(0 ? 1 : 0 || 0);
    expect(scope.$eval('0?2:0||1')).toEqual(0 ? 2 : 0 || 1);

    expect(scope.$eval('1?1:0&&1')).toEqual(1 ? 1 : 0 && 1);
    expect(scope.$eval('1?2:1&&1')).toEqual(1 ? 2 : 1 && 1);
    expect(scope.$eval('1?1:0||0')).toEqual(1 ? 1 : 0 || 0);
    expect(scope.$eval('1?2:0||1')).toEqual(1 ? 2 : 0 || 1);

    // Function calls.
    expect(scope.$eval('returnTrue() ? returnString() : returnInt()')).toEqual(returnTrue() ? returnString() : returnInt());
    expect(scope.$eval('returnFalse() ? returnString() : returnInt()')).toEqual(returnFalse() ? returnString() : returnInt());
    expect(scope.$eval('returnTrue() ? returnString() : returnInt()')).toEqual(returnTrue() ? returnString() : returnInt());
    expect(scope.$eval('identity(returnFalse() ? returnString() : returnInt())')).toEqual(identity(returnFalse() ? returnString() : returnInt()));
  });

  it('should parse string', function() {
    expect(scope.$eval('\'a\' + \'b c\'')).toEqual('ab c');
  });

  // it('should parse filters', function() {
  //   $filterProvider.register('substring', valueFn(function(input, start, end) {
  //     return input.substring(start, end);
  //   }));

  //   expect(function() {
  //     scope.$eval('1|nonexistent');
  //   }).toThrowMinErr('$injector', 'unpr', 'Unknown provider: nonexistentFilterProvider <- nonexistentFilter');

  //   scope.offset =  3;
  //   expect(scope.$eval('\'abcd\'|substring:1:offset')).toEqual('bc');
  //   expect(scope.$eval('\'abcd\'|substring:1:3|uppercase')).toEqual('BC');
  // });

  it('should access scope', function() {
    const scope: any = new Scope();    
    scope.a =  123;
    scope.b = {c: 456};
    expect(scope.$eval('a', scope)).toEqual(123);
    expect(scope.$eval('b.c', scope)).toEqual(456);
    expect(scope.$eval('x.y.z', scope)).not.toBeDefined();
  });

  it('should handle white-spaces around dots in paths', function() {
    const scope: any = new Scope();    
    scope.a = {b: 4};
    expect(scope.$eval('a . b', scope)).toEqual(4);
    expect(scope.$eval('a. b', scope)).toEqual(4);
    expect(scope.$eval('a .b', scope)).toEqual(4);
    expect(scope.$eval('a    . \nb', scope)).toEqual(4);
  });

  it('should handle white-spaces around dots in method invocations', function() {
    const scope: any = new Scope();    
    scope.a = {b: function() { return this.c; }, c: 4};
    expect(scope.$eval('a . b ()', scope)).toEqual(4);
    expect(scope.$eval('a. b ()', scope)).toEqual(4);
    expect(scope.$eval('a .b ()', scope)).toEqual(4);
    expect(scope.$eval('a  \n  . \nb   \n ()', scope)).toEqual(4);
  });

  // it('should throw syntax error exception for identifiers ending with a dot', function() {
  //   scope.a = {b: 4};

  //   expect(function() {
  //     scope.$eval('a.', scope);
  //   }).toThrowMinErr('$parse', 'ueoe',
  //     'Unexpected end of expression: a.');

  //   expect(function() {
  //     scope.$eval('a .', scope);
  //   }).toThrowMinErr('$parse', 'ueoe',
  //     'Unexpected end of expression: a .');
  // });

  it('should resolve deeply nested paths (important for CSP mode)', function() {
    const scope: any = new Scope();
    scope.a = {b: {c: {d: {e: {f: {g: {h: {i: {j: {k: {l: {m: {n: 'nooo!'}}}}}}}}}}}}};
    expect(scope.$eval('a.b.c.d.e.f.g.h.i.j.k.l.m.n', scope)).toBe('nooo!');
  });

  [2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 42, 99].forEach(function(pathLength: any) {
    it('should resolve nested paths of length ' + pathLength, function() {
      // Create a nested object {x2: {x3: {x4: ... {x[n]: 42} ... }}}.
      var obj = 42, locals: any = {};
      for (var i = pathLength; i >= 2; i--) {
        var newObj: any = {};
        newObj['x' + i] = obj;
        obj = newObj;
      }
      // Assign to x1 and build path 'x1.x2.x3. ... .x[n]' to access the final value.
      scope.x1 = obj;
      var path = 'x1';
      for (i = 2; i <= pathLength; i++) {
        path += '.x' + i;
      }
      expect(scope.$eval(path)).toBe(42);
      locals['x' + pathLength] = 'not 42';
      expect(scope.$eval(path, locals)).toBe(42);
    });
  });

  it('should be forgiving', function() {
    const scope: any = new Scope();
    scope.a = {b: 23};
    expect(scope.$eval('b')).toBeUndefined();
    expect(scope.$eval('a.x')).toBeUndefined();
    expect(scope.$eval('a.b.c.d')).toBeUndefined();
    scope.a = undefined;
    expect(scope.$eval('a - b')).toBe(0);
    expect(scope.$eval('a + b')).toBeUndefined();
    scope.a = 0;
    expect(scope.$eval('a - b')).toBe(0);
    expect(scope.$eval('a + b')).toBe(0);
    scope.a = undefined;
    scope.b = 0;
    expect(scope.$eval('a - b')).toBe(0);
    expect(scope.$eval('a + b')).toBe(0);
  });

  it('should support property names that collide with native object properties', function() {    
    // regression
    const scope: any = new Scope();
    scope.watch = 1;
    scope.toString = function toString() {
      return 'custom toString';
    };

    expect(scope.$eval('watch', scope)).toBe(1);
    expect(scope.$eval('toString()', scope)).toBe('custom toString');
  });

  it('should not break if hasOwnProperty is referenced in an expression', function() {
    const scope: any = new Scope();    
    scope.obj = { value: 1};
    // By evaluating an expression that calls hasOwnProperty, the getterFnCache
    // will store a property called hasOwnProperty.  This is effectively:
    // getterFnCache['hasOwnProperty'] = null
    scope.$eval('obj.hasOwnProperty("value")');
    // If we rely on this property then evaluating any expression will fail
    // because it is not able to find out if obj.value is there in the cache
    expect(scope.$eval('obj.value')).toBe(1);
  });

  it('should not break if the expression is "hasOwnProperty"', function() {
    const scope: any = new Scope();    
    scope.fooExp = 'barVal';
    // By evaluating hasOwnProperty, the $parse cache will store a getter for
    // the scope's own hasOwnProperty function, which will mess up future cache look ups.
    // i.e. cache['hasOwnProperty'] = function(scope) { return scope.hasOwnProperty; }
    scope.$eval('hasOwnProperty');
    expect(scope.$eval('fooExp')).toBe('barVal');
  });

  it('should evaluate grouped expressions', function() {
    const scope: any = new Scope();    
    expect(scope.$eval('(1+2)*3')).toEqual((1 + 2) * 3);
  });

  it('should evaluate assignments', function() {
    const scope: any = new Scope();    
    expect(scope.$eval('a=12')).toEqual(12);
    expect(scope.a).toEqual(12);

    expect(scope.$eval('x.y.z=123;')).toEqual(123);
    expect(scope.x.y.z).toEqual(123);

    expect(scope.$eval('a=123; b=234')).toEqual(234);
    expect(scope.a).toEqual(123);
    expect(scope.b).toEqual(234);
  });

  // it('should throw with invalid left-val in assignments', function() {
  //   expect(function() { scope.$eval('1 = 1'); }).toThrowMinErr('$parse', 'lval');
  //   expect(function() { scope.$eval('{} = 1'); }).toThrowMinErr('$parse', 'lval');
  //   expect(function() { scope.$eval('[] = 1'); }).toThrowMinErr('$parse', 'lval');
  //   expect(function() { scope.$eval('true = 1'); }).toThrowMinErr('$parse', 'lval');
  //   expect(function() { scope.$eval('(a=b) = 1'); }).toThrowMinErr('$parse', 'lval');
  //   expect(function() { scope.$eval('(1<2) = 1'); }).toThrowMinErr('$parse', 'lval');
  //   expect(function() { scope.$eval('(1+2) = 1'); }).toThrowMinErr('$parse', 'lval');
  //   expect(function() { scope.$eval('!v = 1'); }).toThrowMinErr('$parse', 'lval');
  //   expect(function() { scope.$eval('this = 1'); }).toThrowMinErr('$parse', 'lval');
  //   expect(function() { scope.$eval('+v = 1'); }).toThrowMinErr('$parse', 'lval');
  //   expect(function() { scope.$eval('(1?v1:v2) = 1'); }).toThrowMinErr('$parse', 'lval');
  // });

  it('should evaluate assignments in ternary operator', function() {
    const scope: any = new Scope();    
    scope.$eval('a = 1 ? 2 : 3');
    expect(scope.a).toBe(2);

    scope.$eval('0 ? a = 2 : a = 3');
    expect(scope.a).toBe(3);

    scope.$eval('1 ? a = 2 : a = 3');
    expect(scope.a).toBe(2);
  });

  it('should evaluate function call without arguments', function() {
    const scope: any = new Scope();    
    scope['const'] =  function(a: any, b: any) {return 123;};
    expect(scope.$eval('const()')).toEqual(123);
  });

  it('should evaluate function call with arguments', function() {
    const scope: any = new Scope();    
    scope.add =  function(a: any, b: any) {
      return a + b;
    };
    expect(scope.$eval('add(1,2)')).toEqual(3);
  });

  // it('should allow filter chains as arguments', function() {
  //   const scope: any = new Scope();
  //   scope.concat = function(a: any, b: any) {
  //     return a + b;
  //   };
  //   scope.begin = 1;
  //   scope.limit = 2;
  //   expect(scope.$eval('concat(\'abcd\'|limitTo:limit:begin,\'abcd\'|limitTo:2:1|uppercase)')).toEqual('bcBC');
  // });

  it('should evaluate function call from a return value', function() {
    const scope: any = new Scope();    
    scope.getter = function() { return function() { return 33; }; };
    expect(scope.$eval('getter()()')).toBe(33);
  });

  it('should evaluate multiplication and division', function() {
    const scope: any = new Scope();    
    scope.taxRate =  8;
    scope.subTotal =  100;
    expect(scope.$eval('taxRate / 100 * subTotal')).toEqual(8);
    expect(scope.$eval('subTotal * taxRate / 100')).toEqual(8);
  });

  it('should evaluate array', function() {
    const scope: any = new Scope();    
    expect(scope.$eval('[]').length).toEqual(0);
    expect(scope.$eval('[1, 2]').length).toEqual(2);
    expect(scope.$eval('[1, 2]')[0]).toEqual(1);
    expect(scope.$eval('[1, 2]')[1]).toEqual(2);
    expect(scope.$eval('[1, 2,]')[1]).toEqual(2);
    expect(scope.$eval('[1, 2,]').length).toEqual(2);
  });

  it('should evaluate array access', function() {
    const scope: any = new Scope();    
    expect(scope.$eval('[1][0]')).toEqual(1);
    expect(scope.$eval('[[1]][0][0]')).toEqual(1);
    expect(scope.$eval('[].length')).toEqual(0);
    expect(scope.$eval('[1, 2].length')).toEqual(2);
  });

  it('should evaluate object', function() {
    const scope: any = new Scope();
    expect(scope.$eval('{}')).toEqual({});
    expect(scope.$eval('{a:\'b\'}')).toEqual({a:'b'});
    expect(scope.$eval('{\'a\':\'b\'}')).toEqual({a:'b'});
    expect(scope.$eval('{"a":\'b\'}')).toEqual({a:'b'});
    expect(scope.$eval('{a:\'b\',}')).toEqual({a:'b'});
    expect(scope.$eval('{\'a\':\'b\',}')).toEqual({a:'b'});
    expect(scope.$eval('{"a":\'b\',}')).toEqual({a:'b'});
    expect(scope.$eval('{\'0\':1}')).toEqual({0:1});
    expect(scope.$eval('{0:1}')).toEqual({0:1});
    expect(scope.$eval('{1:1}')).toEqual({1:1});
    expect(scope.$eval('{null:1}')).toEqual({null:1});
    expect(scope.$eval('{\'null\':1}')).toEqual({null:1});
    expect(scope.$eval('{false:1}')).toEqual({false:1});
    expect(scope.$eval('{\'false\':1}')).toEqual({false:1});
    expect(scope.$eval('{\'\':1,}')).toEqual({'':1});
  });

  // it('should throw syntax error exception for non constant/identifier JSON keys', function() {
  //   expect(function() { scope.$eval('{[:0}'); }).toThrowMinErr('$parse', 'syntax',
  //     'Syntax Error: Token \':\' not a primary expression at column 3 of the expression [{[:0}] starting at [:0}]');
  //   expect(function() { scope.$eval('{{:0}'); }).toThrowMinErr('$parse', 'syntax',
  //     'Syntax Error: Token \'{\' invalid key at column 2 of the expression [{{:0}] starting at [{:0}]');
  //   expect(function() { scope.$eval('{?:0}'); }).toThrowMinErr('$parse', 'syntax',
  //     'Syntax Error: Token \'?\' invalid key at column 2 of the expression [{?:0}] starting at [?:0}]');
  //   expect(function() { scope.$eval('{):0}'); }).toThrowMinErr('$parse', 'syntax',
  //     'Syntax Error: Token \')\' invalid key at column 2 of the expression [{):0}] starting at [):0}]');
  // });

  it('should evaluate object access', function() {
    const scope: any = new Scope();    
    expect(scope.$eval('{false:\'WC\', true:\'CC\'}[false]')).toEqual('WC');
  });

  it('should evaluate JSON', function() {
    const scope: any = new Scope();
    expect(scope.$eval('[{}]')).toEqual([{}]);
    expect(scope.$eval('[{a:[]}, {b:1}]')).toEqual([{a:[]}, {b:1}]);
  });

  it('should evaluate multiple statements', function() {
    const scope: any = new Scope();    
    expect(scope.$eval('a=1;b=3;a+b')).toEqual(4);
    expect(scope.$eval(';;1;;')).toEqual(1);
  });

  it('should evaluate object methods in correct context (this)', function() {   
    const scope: any = new Scope();    
    class C {
      a = 123;
      getA(){
        return this.a;
      }
    }

    scope.obj = new C();
    expect(scope.$eval('obj.getA()')).toEqual(123);
    expect(scope.$eval('obj[\'getA\']()')).toEqual(123);
  });

  it('should evaluate methods in correct context (this) in argument', function() {
    const scope: any = new Scope();    
    // function C() {
    //   this.a = 123;
    // }
    // C.prototype.sum = function(value) {
    //   return this.a + value;
    // };
    // C.prototype.getA = function() {
    //   return this.a;
    // };

    class C {
      a = 123;
      sum(value: any){
        return this.a + value;
      }
      getA(){
        return this.a;
      }
    }

    scope.obj = new C();
    expect(scope.$eval('obj.sum(obj.getA())')).toEqual(246);
    expect(scope.$eval('obj[\'sum\'](obj.getA())')).toEqual(246);
  });

  it('should evaluate objects on scope context', function() {
    const scope: any = new Scope();    
    scope.a =  'abc';
    expect(scope.$eval('{a:a}').a).toEqual('abc');
  });

  it('should evaluate field access on function call result', function() {
    const scope: any = new Scope();    
    scope.a =  function() {
      return {name:'misko'};
    };
    expect(scope.$eval('a().name')).toEqual('misko');
  });

  it('should evaluate field access after array access', function() {
    const scope: any = new Scope();    
    scope.items =  [{}, {name:'misko'}];
    expect(scope.$eval('items[1].name')).toEqual('misko');
  });

  it('should evaluate array assignment', function() {
    const scope: any = new Scope();    
    scope.items =  [];

    expect(scope.$eval('items[1] = "abc"')).toEqual('abc');
    expect(scope.$eval('items[1]')).toEqual('abc');
    expect(scope.$eval('books[1] = "moby"')).toEqual('moby');
    expect(scope.$eval('books[1]')).toEqual('moby');
  });

  // it('should evaluate grouped filters', function() {
  //   const scope: any = new Scope();    
  //   scope.name = 'MISKO';
  //   expect(scope.$eval('n = (name|lowercase)')).toEqual('misko');
  //   expect(scope.$eval('n')).toEqual('misko');
  // });

  it('should evaluate remainder', function() {    
    expect(scope.$eval('1%2')).toEqual(1);
  });

  it('should evaluate sum with undefined', function() {
    expect(scope.$eval('1+undefined')).toEqual(1);
    expect(scope.$eval('undefined+1')).toEqual(1);
  });

  // it('should throw exception on non-closed bracket', function() {
  //   expect(function() {
  //     scope.$eval('[].count(');
  //   }).toThrowMinErr('$parse', 'ueoe', 'Unexpected end of expression: [].count(');
  // });

  it('should evaluate double negation', function() {
    const scope: any = new Scope();    
    expect(scope.$eval('true')).toBeTruthy();
    expect(scope.$eval('!true')).toBeFalsy();
    expect(scope.$eval('!!true')).toBeTruthy();
    expect(scope.$eval('{true:"a", false:"b"}[!!true]')).toEqual('a');
  });

  it('should evaluate negation', function() {
    const scope: any = new Scope();    
    expect(scope.$eval('!false || true')).toEqual(!false || true);
    // eslint-disable-next-line eqeqeq
    // expect(scope.$eval('!11 == 10')).toEqual(!11 == 10);
    expect(scope.$eval('!11 == 10')).toEqual(false);    
    expect(scope.$eval('12/6/2')).toEqual(12 / 6 / 2);
  });

  it('should evaluate exclamation mark', function() {
    const scope: any = new Scope();    
    expect(scope.$eval('suffix = "!"')).toEqual('!');
  });

  it('should evaluate minus', function() {
    expect(scope.$eval('{a:\'-\'}')).toEqual({a: '-'});
  });

  // 由于undefined和ESTree接口定义冲突, 统一处理eval(undefined)为null
  it('should evaluate undefined', function() {
    const scope: any = new Scope();
    // expect(scope.$eval('undefined')).not.toBeDefined();
    // expect(scope.$eval('a=undefined')).not.toBeDefined();
    // expect(scope.a).not.toBeDefined();
    expect(scope.$eval('undefined')).toEqual(null);
    expect(scope.$eval('a=undefined')).toEqual(null);
    expect(scope.a).toEqual(null);
  });

  it('should allow assignment after array dereference', function() {
    const scope: any = new Scope();    
    scope.obj = [{}];
    scope.$eval('obj[0].name=1');
    expect(scope.obj.name).toBeUndefined();
    expect(scope.obj[0].name).toEqual(1);
  });

  it('should short-circuit AND operator', function() {    
    scope.run = function() {
      throw new Error('IT SHOULD NOT HAVE RUN');
    };
    expect(scope.$eval('false && run()')).toBe(false);
    expect(scope.$eval('false && true && run()')).toBe(false);
  });

  it('should short-circuit OR operator', function() {
    scope.run = function() {
      throw new Error('IT SHOULD NOT HAVE RUN');
    };
    expect(scope.$eval('true || run()')).toBe(true);
    expect(scope.$eval('true || false || run()')).toBe(true);
  });

  // it('should throw TypeError on using a \'broken\' object as a key to access a property', function() {
  //   scope.object = {};
  //   forEach([
  //     { toString: 2 },
  //     { toString: null },
  //     { toString: function() { return {}; } }
  //   ], function(brokenObject) {
  //     scope.brokenObject = brokenObject;
  //     expect(function() {
  //       scope.$eval('object[brokenObject]');
  //     }).toThrow();
  //   });
  // });

  it('should support method calls on primitive types', function() {
    const scope: any = new Scope();    
    scope.empty = '';
    scope.zero = 0;
    scope.bool = false;

    expect(scope.$eval('empty.substr(0)')).toBe('');
    expect(scope.$eval('zero.toString()')).toBe('0');
    expect(scope.$eval('bool.toString()')).toBe('false');
  });

  it('should evaluate expressions with line terminators', function() {
    const scope: any = new Scope();    
    scope.a = 'a';
    scope.b = {c: 'bc'};
    expect(scope.$eval('a + \n b.c + \r "\td" + \t \r\n\r "\r\n\n"')).toEqual('abc\td\r\n\n');
  });

  // https://github.com/angular/angular.js/issues/10968
  it('should evaluate arrays literals initializers left-to-right', function() {
    const scope: any = new Scope();    
    var s: any = {c:function() {return {b: 1}; }};
    expect($parse('e=1;[a=c(),d=a.b+1]')(s)).toEqual([{b: 1}, 2]);
  });

  it('should evaluate function arguments left-to-right', function() {
    const scope: any = new Scope();    
    var s: any = {c:function() {return {b: 1}; }, i: function(x: any, y: any) { return [x, y];}};
    expect($parse('e=1;i(a=c(),d=a.b+1)')(s)).toEqual([{b: 1}, 2]);
  });

  it('should evaluate object properties expressions left-to-right', function() {
    const scope: any = new Scope();    
    var s: any = {c:function() {return {b: 1}; }};
    expect($parse('e=1;{x: a=c(), y: d=a.b+1}')(s)).toEqual({x: {b: 1}, y: 2});
  });

  it('should call the function from the received instance and not from a new one', function() {
    const scope: any = new Scope();
    var n = 0;
    scope.fn = function() {
      var c = n++;
      return { c: c, anotherFn: function() { return this.c === c; } };
    };
    expect(scope.$eval('fn().anotherFn()')).toBe(true);
  });


  it('should call the function once when it is part of the context', function() {
    const scope: any = new Scope();    
    var count = 0;
    scope.fn = function() {
      count++;
      return { anotherFn: function() { return 'lucas'; } };
    };
    expect(scope.$eval('fn().anotherFn()')).toBe('lucas');
    expect(count).toBe(1);
  });


  it('should call the function once when it is not part of the context', function() {
    const scope: any = new Scope();    
    var count = 0;
    scope.fn = function() {
      count++;
      return function() { return 'lucas'; };
    };
    expect(scope.$eval('fn()()')).toBe('lucas');
    expect(count).toBe(1);
  });


  it('should call the function once when it is part of the context on assignments', function() {
    const scope: any = new Scope();
    var count = 0;
    var element: any = {};
    scope.fn = function() {
      count++;
      return element;
    };
    expect(scope.$eval('fn().name = "lucas"')).toBe('lucas');
    expect(element.name).toBe('lucas');
    expect(count).toBe(1);
  });


  it('should call the function once when it is part of the context on array lookups', function() {
    const scope: any = new Scope();
    var count = 0;
    var element: any = [];
    scope.fn = function() {
      count++;
      return element;
    };
    expect(scope.$eval('fn()[0] = "lucas"')).toBe('lucas');
    expect(element[0]).toBe('lucas');
    expect(count).toBe(1);
  });

  it('should call the function once when it is part of the context on array lookup function', function() {
    const scope: any = new Scope();
    var count = 0;
    var element = [{anotherFn: function() { return 'lucas';} }];
    scope.fn = function() {
      count++;
      return element;
    };
    expect(scope.$eval('fn()[0].anotherFn()')).toBe('lucas');
    expect(count).toBe(1);
  });


  it('should call the function once when it is part of the context on property lookup function', function() {
    const scope: any = new Scope();
    var count = 0;
    var element = {name: {anotherFn: function() { return 'lucas';} } };
    scope.fn = function() {
      count++;
      return element;
    };
    expect(scope.$eval('fn().name.anotherFn()')).toBe('lucas');
    expect(count).toBe(1);
  });


  it('should call the function once when it is part of a sub-expression', function() {
    const scope: any = new Scope();
    var count = 0;
    scope.element = [{}];
    scope.fn = function() {
      count++;
      return 0;
    };
    expect(scope.$eval('element[fn()].name = "lucas"')).toBe('lucas');
    expect(scope.element[0].name).toBe('lucas');
    expect(count).toBe(1);
  });


  // describe('assignable', function() {
  //   it('should expose assignment function', function() {
  //     var fn = $parse('a');
  //     expect(fn.assign).toBeTruthy();
  //     var scope = {};
  //     fn.assign(scope, 123);
  //     expect(scope).toEqual({a:123});
  //   });

  //   it('should return the assigned value', function() {
  //     var fn = $parse('a');
  //     var scope = {};
  //     expect(fn.assign(scope, 123)).toBe(123);
  //     var someObject = {};
  //     expect(fn.assign(scope, someObject)).toBe(someObject);
  //   }));

  //   it('should expose working assignment function for expressions ending with brackets', function() {
  //     var fn = $parse('a.b["c"]');
  //     expect(fn.assign).toBeTruthy();
  //     var scope = {};
  //     fn.assign(scope, 123);
  //     expect(scope.a.b.c).toEqual(123);
  //   }));

  //   it('should expose working assignment function for expressions with brackets in the middle', function() {
  //     var fn = $parse('a["b"].c');
  //     expect(fn.assign).toBeTruthy();
  //     var scope = {};
  //     fn.assign(scope, 123);
  //     expect(scope.a.b.c).toEqual(123);
  //   }));

  //   it('should create objects when finding a null', function() {
  //     var fn = $parse('foo.bar');
  //     var scope = {foo: null};
  //     fn.assign(scope, 123);
  //     expect(scope.foo.bar).toEqual(123);
  //   }));

  //   it('should create objects when finding a null', function() {
  //     var fn = $parse('foo["bar"]');
  //     var scope = {foo: null};
  //     fn.assign(scope, 123);
  //     expect(scope.foo.bar).toEqual(123);
  //   }));

  //   it('should create objects when finding a null', function() {
  //     var fn = $parse('foo.bar.baz');
  //     var scope = {foo: null};
  //     fn.assign(scope, 123);
  //     expect(scope.foo.bar.baz).toEqual(123);
  //   }))
  // });

  describe('null/undefined in expressions', function() {
    // simpleGetterFn1
    it('should return null for `a` where `a` is null', inject(function($rootScope: any) {
      $rootScope.a = null;
      expect($rootScope.$eval('a')).toBe(null);
    }));

    it('should return undefined for `a` where `a` is undefined', inject(function($rootScope: any) {
      expect($rootScope.$eval('a')).toBeUndefined();
    }));

    // 不支持
    // simpleGetterFn2
    // it('should return undefined for properties of `null` constant', inject(function($rootScope: any) {
    //   expect($rootScope.$eval('null.a')).toBeUndefined();
    // }));

    it('should return undefined for properties of `null` values', inject(function($rootScope: any) {
      $rootScope.a = null;
      expect($rootScope.$eval('a.b')).toBeUndefined();
    }));

    it('should return null for `a.b` where `b` is null', inject(function($rootScope: any) {
      $rootScope.a = { b: null };
      expect($rootScope.$eval('a.b')).toBe(null);
    }));

    // cspSafeGetter && pathKeys.length < 6 || pathKeys.length > 2
    it('should return null for `a.b.c.d.e` where `e` is null', inject(function($rootScope: any) {
      $rootScope.a = { b: { c: { d: { e: null } } } };
      expect($rootScope.$eval('a.b.c.d.e')).toBe(null);
    }));

    it('should return undefined for `a.b.c.d.e` where `d` is null', inject(function($rootScope: any) {
      $rootScope.a = { b: { c: { d: null } } };
      expect($rootScope.$eval('a.b.c.d.e')).toBeUndefined();
    }));

    // cspSafeGetter || pathKeys.length > 6
    it('should return null for `a.b.c.d.e.f.g` where `g` is null', inject(function($rootScope: any) {
      $rootScope.a = { b: { c: { d: { e: { f: { g: null } } } } } };
      expect($rootScope.$eval('a.b.c.d.e.f.g')).toBe(null);
    }));

    it('should return undefined for `a.b.c.d.e.f.g` where `f` is null', inject(function($rootScope: any) {
      $rootScope.a = { b: { c: { d: { e: { f: null } } } } };
      expect($rootScope.$eval('a.b.c.d.e.f.g')).toBeUndefined();
    }));

    it('should return undefined if the return value of a function invocation is undefined',
        inject(function($rootScope: any) {
      $rootScope.fn = function() {};
      expect($rootScope.$eval('fn()')).toBeUndefined();
    }));

    it('should ignore undefined values when doing addition/concatenation',
        inject(function($rootScope: any) {
      $rootScope.fn = function() {};
      expect($rootScope.$eval('foo + "bar" + fn()')).toBe('bar');
    }));

    // 不打算支持这种 null, undefined 作为变量名的情况了
    // it('should treat properties named null/undefined as normal properties', inject(function($rootScope: any) {
    //   expect($rootScope.$eval('a.null.undefined.b', {a:{null:{undefined:{b: 1}}}})).toBe(1);
    // }));

    // it('should not allow overriding null/undefined keywords', inject(function($rootScope: any) {
    //   expect($rootScope.$eval('null.a', {null: {a: 42}})).toBeUndefined();
    // }));

    // it('should allow accessing null/undefined properties on `this`', inject(function($rootScope: any) {
    //   $rootScope.null = {a: 42};
    //   expect($rootScope.$eval('this.null.a')).toBe(42);
    // }));

    // it('should allow accessing $locals', inject(function($rootScope: any) {
    //   $rootScope.foo = 'foo';
    //   $rootScope.bar = 'bar';
    //   $rootScope.$locals = 'foo';
    //   var locals = {foo: 42};
    //   expect($rootScope.$eval('$locals')).toBeUndefined();
    //   expect($rootScope.$eval('$locals.foo')).toBeUndefined();
    //   expect($rootScope.$eval('this.$locals')).toBe('foo');
    //   expect(function() {
    //     $rootScope.$eval('$locals = {}');
    //   }).toThrow();
    //   expect(function() {
    //     $rootScope.$eval('$locals.bar = 23');
    //   }).toThrow();
    //   expect($rootScope.$eval('$locals', locals)).toBe(locals);
    //   expect($rootScope.$eval('$locals.foo', locals)).toBe(42);
    //   expect($rootScope.$eval('this.$locals', locals)).toBe('foo');
    //   expect(function() {
    //     $rootScope.$eval('$locals = {}', locals);
    //   }).toThrow();
    //   expect($rootScope.$eval('$locals.bar = 23', locals)).toEqual(23);
    //   expect(locals.bar).toBe(23);
    // }));
  });

  describe('literal', function() {
    it('should mark scalar value expressions as literal', function() {
      expect($parse('0').literal).toBe(true);
      expect($parse('"hello"').literal).toBe(true);
      expect($parse('true').literal).toBe(true);
      expect($parse('false').literal).toBe(true);
      expect($parse('null').literal).toBe(true);
      expect($parse('undefined').literal).toBe(true);
    });

    it('should mark array expressions as literal', function() {
      expect($parse('[]').literal).toBe(true);
      expect($parse('[1, 2, 3]').literal).toBe(true);
      expect($parse('[1, identifier]').literal).toBe(true);
    });

    it('should mark object expressions as literal', function() {
      expect($parse('{}').literal).toBe(true);
      expect($parse('{x: 1}').literal).toBe(true);
      expect($parse('{foo: bar}').literal).toBe(true);
    });

    it('should not mark function calls or operator expressions as literal', function() {
      // after constant folding 1 + 1 will be literal and constant。。。
      // expect($parse('1 + 1').literal).toBe(false);
      expect($parse('call()').literal).toBe(false);
      // expect($parse('[].length').literal).toBe(false);
      expect($parse('[].length').literal).toBe(true);
    });
  });

  describe('constant', function() {
    it('should mark an empty expressions as constant', function() {
      expect($parse('').constant).toBe(true);
      expect($parse('   ').constant).toBe(true);

      // todo One-time binding 暂时还不兹磁
      // expect($parse('::').constant).toBe(true);
      // expect($parse('::    ').constant).toBe(true);
    });

    it('should mark scalar value expressions as constant', function() {
      expect($parse('12.3').constant).toBe(true);
      expect($parse('"string"').constant).toBe(true);
      expect($parse('true').constant).toBe(true);
      expect($parse('false').constant).toBe(true);
      expect($parse('null').constant).toBe(true);
      expect($parse('undefined').constant).toBe(true);
    });

    it('should mark arrays as constant if they only contain constant elements', function() {
      expect($parse('[]').constant).toBe(true);
      expect($parse('[1, 2, 3]').constant).toBe(true);
      expect($parse('["string", null]').constant).toBe(true);
      expect($parse('[[]]').constant).toBe(true);
      expect($parse('[1, [2, 3], {4: 5}]').constant).toBe(true);
    });

    it('should not mark arrays as constant if they contain any non-constant elements', function() {
      expect($parse('[foo]').constant).toBe(false);
      expect($parse('[x + 1]').constant).toBe(false);
      expect($parse('[bar[0]]').constant).toBe(false);
    });

    it('should mark complex expressions involving constant values as constant', function() {
      expect($parse('!true').constant).toBe(true);
      expect($parse('-42').constant).toBe(true);
      expect($parse('1 - 1').constant).toBe(true);
      expect($parse('"foo" + "bar"').constant).toBe(true);
      expect($parse('5 != null').constant).toBe(true);
      expect($parse('{standard: 4/3, wide: 16/9}').constant).toBe(true);

      // 不支持, es6的对象定义方式
      // expect($parse('{[standard]: 4/3, wide: 16/9}').constant).toBe(false);
      // expect($parse('{["key"]: 1}').constant).toBe(true);
      expect($parse('{standard: 4/3, wide: 16/9}').constant).toBe(true);
      expect($parse('{"key": 1}').constant).toBe(true);      
      expect($parse('[0].length').constant).toBe(true);
      expect($parse('[0][0]').constant).toBe(true);
      expect($parse('{x: 1}.x').constant).toBe(true);
      expect($parse('{x: 1}["x"]').constant).toBe(true);
    });

    it('should not mark any expression involving variables or function calls as constant', function() {
      expect($parse('true.toString()').constant).toBe(false);
      expect($parse('foo(1, 2, 3)').constant).toBe(false);
      expect($parse('"name" + id').constant).toBe(false);
    });
  });
});
