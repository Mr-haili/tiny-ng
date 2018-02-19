import { _ } from 'util/util';
import { $parse } from 'tiny-ng/expression-parser/parse';
import { ExprFn, ActionFn } from 'tiny-ng/types';

function stringify(value: any) {
	if (_.isNull(value) || _.isUndefined(value)) {
		return '';
	} else if (_.isObject(value)) {
		return JSON.stringify(value);
	} else {
		return '' + value;
	}
}

export function $interpolate(text: string): ExprFn | null {
	if(_.isNil(text)) return null;

	const parts: Array<string | ExprFn> = [];
	const expressions: string[] = [];
	const expressionFns: ExprFn[] = [];
	const expressionPositions: number[] = [];

	let index: number = 0, startIndex: number = 0, endIndex: number = 0;  
	let exp: string, expFn: ExprFn;

	while(index < text.length)
	{
		startIndex = text.indexOf('{{', index);
		if (startIndex !== -1) endIndex = text.indexOf('}}', startIndex + 2);

		if (-1 !== startIndex && -1 !== endIndex)
		{
			if(startIndex !== index)
			{
				parts.push(text.substring(index, startIndex));
			}

			exp = text.substring(startIndex + 2, endIndex);
			expFn = $parse(exp);
			expressions.push(exp);
			expressionFns.push(expFn);
			expressionPositions.push(parts.length);
			parts.push(expFn);

			index = endIndex + 2;
		}
		else
		{
			// 说明没有差值啊混蛋!!!!!!!
			parts.push(text.substring(index));
			break;
		}
	}

	function compute(values: Array<any>): string {
		_.forEach(values, function(value: any, i: number){
			parts[expressionPositions[i]] = stringify(value);
		});
		return parts.join('');
	}

	if(expressions.length){
		// 实际上这个函数并没有被调用
		const interpolationFn: ExprFn = function(context: any, locals: any){
			var values = expressionFns.map(expressionFn => {
				return expressionFn(context, locals);
			});
			return compute(values);
		}

		// interpolationFn.expressions = expressions;
		// interpolationFn.$$watchDelegate = function(scope: Scope, listener: ActionFn) {
		// 	let lastValue: any;
		// 	return scope.$watchGroup(expressionFns, function(newValues, oldValues) {
		// 		var newValue = compute(newValues);
		// 		listener(newValue, lastValue, scope);
		// 		lastValue = newValue;
		// 	});
		// }

		interpolationFn.expression = text;

		return interpolationFn
	}
	return null;
}

export default $interpolate;