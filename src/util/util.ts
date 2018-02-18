// todo 这个写的有点问题, 后面查看下loadsh代码
function isEqual(x: any, y: any): boolean { return x === y; }
function isString(x: any): x is string { return 'string' === typeof(x); }
function isNumber(x: any): x is number { return 'number' === typeof(x); }
function isArray(v: any): boolean { return v instanceof Array };
function isNull(v: any): v is null { return v === null; }
function isUndefined(v: any): v is undefined { return v === undefined; }
function isNil(v: any): v is null | undefined { return v == null; }
function isObject(v: any): v is Object {
  const type = typeof v;
  return v != null && (type === 'object' || type === 'function')
}
function last(x: Array<any>): any {
	if(!isArrayLike(x)) return null;
	return x[x.length - 1];
}

// todo 这个实现和loadash的实现比起来异常的简陋
function isFunction(x : any): x is Function { return 'function' === typeof x; }

// isLength
const MAX_SAFE_INTEGER = 9007199254740991
function isLength(value: any): boolean {
	return typeof value === 'number' && 
		value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER
}

// 非空, 非函数, length合法
function isArrayLike(value: any): boolean {
  return value != null && typeof value != 'function' && isLength(value.length)
}

/*
 * 把字符串按照非字母间隔来分割
 * chunkSplit
 */
function chunkSplit(str: string): string[] {
	return str.replace(/[A-Z]+/g, s => ' ' + s).split(/[^A-Za-z]+/g).filter(s => 0 < s.length);
}

// 转换字符串首写大写, 其余小写
function capitalize(str: string): string {
	str = str.toLowerCase();
	if(str.length < 1) return str;
	return str[0].toUpperCase() + str.slice(1);
}

/*
 * camelCase('Foo Bar');
 * camelCase('--foo-bar--');
 * camelCase('__FOO_BAR__');
 * // => 'fooBar'
 */
function camelCase(str: string): string {
	return chunkSplit(str).map((s, i) => 0 === i ? s.toLowerCase() : capitalize(s)).join('');
}

/*
 * _.kebabCase('Foo Bar');
 * _.kebabCase('fooBar');
 * _.kebabCase('__FOO_BAR__');
 * // => 'foo-bar'
 */
function kebabCase(str: string): string {
	return chunkSplit(str).map(s => s.toLowerCase()).join('-');
}

type Interatee<T> = (element: T, index: number, array: ReadonlyArray<T>) => boolean | void;
function forEach<T>(array: ReadonlyArray<T>, iteratee: Interatee<T>): Array<T> {
  const length = array == null ? 0 : array.length
  for(let i = 0; i < length; i++)
  {
    if(iteratee(array[i], i, array) === false) break;
  }
  return <Array<T>>array;
}

function forEachRight<T>(array: ReadonlyArray<T>, iteratee: Interatee<T>): Array<T> {
  const length = array == null ? 0 : array.length
  for(let i = length; i >= 0; i++)
  {
    if(iteratee(array[i], i, array) === false) break;
  }
  return <Array<T>>array;
}

function arrayInsert(arr: Array<any>, index: number, item: any): Array<any> {
  if(!arr) return arr;
  arr.splice(index, 0, item);
  return arr;
}

function arrayRemove(arr: Array<any>, index: number): Array<any> {
  if(!arr) return arr;
  arr.splice(index, 1);
  return arr;  
}

export const _ = {
	isEqual,
	isString,
	isNumber,
	isArray,
	isNull,
	isUndefined,
	isNil,
	isObject,
	last,
	isFunction,
	isLength,
	isArrayLike,
	chunkSplit,
	capitalize,
	camelCase,
	kebabCase,
	forEach,
	forEachRight,
	arrayInsert,
	arrayRemove
}

export default _;