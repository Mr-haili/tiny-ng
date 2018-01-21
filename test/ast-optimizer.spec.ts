// import { AstOptimizer, parser, Ast } from '../src/main';
// import { Constant } from '..//compile-util/ast-trees';

// const astOptimizer: AstOptimizer = new AstOptimizer();
// const checkOptimize = function(txt: string, expectedAstOrValue: any): void {
// 	const ast = parser.parse(txt);
// 	const optimizedAst = astOptimizer.optimize(ast);
// 	const expectedAst: Ast = (expectedAstOrValue instanceof Ast) ? 
// 		expectedAstOrValue : new Constant(expectedAstOrValue);

// 	expect(optimizedAst).toEqual(expectedAst);
// }

// describe('astOptimize', function() {
// 	it('reduce binary-expression', function() {
// 		checkOptimize('1 + 2 * 5 + (2 * 3)/6', 1 + 2 * 5 + (2 * 3)/6);
// 		checkOptimize('1 >= 2', 1 >= 2);
// 		checkOptimize('1 <= 2 + 4', 1 <= 2 + 4);
// 		checkOptimize('0--1+1.5', 0 - -1 + 1.5);
// 		checkOptimize('-0--1++2*-3/-4', -0 - -1 + +2 * -3 / -4);
// 	});

// 	it('reduce unary-expression', function() {
// 		checkOptimize('!!!!!!!!true', !!!!!!!!true);
// 		checkOptimize('!!!!!!!!!true', !!!!!!!!!true);
// 	});

// 	it('reduce logical-expression', function() {
// 		checkOptimize('true ? 1 : 2', true ? 1 : 2);
// 		checkOptimize('false ? 1 : 2', false ? 1 : 2);

// 		// TODO =我整理下代码
// 		// checkOptimize('a ? 0 + 1 : 0 + 2', new Con)
// 	});

// 	// it('reduce member-expression', function() {
// 	// 	checkOptimize('a[\'1\' + 2][3 + 3]')
// 	// });
// });

