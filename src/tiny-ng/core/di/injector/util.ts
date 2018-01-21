// 用于将一个token字符串化
export function tokenStringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (token instanceof Array) {
    return '[' + token.map(tokenStringify).join(', ') + ']';
  }

  if (token == null) {
    return '' + token;
  }

  if (token.overriddenName) {
    return `${token.overriddenName}`;
  }

  if (token.name) {
    return `${token.name}`;
  }

  const res = token.toString();

  if (res == null) {
    return '' + res;
  }

  const newLineIndex = res.indexOf('\n');
  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}

// 工具函数用于获取函数的参数列表
const REGEX_ARROW_ARG = /^([^(]+?)=>/;
const REGEX_FN_ARGS = /^[^(]*\(\s*([^)]*)\)/m;
const REGEX_FN_ARG_SPLIT = /,/;
const REGEX_FN_ARG = /^\s*(_?)(\S+?)\1\s*$/; // TODO 这个没搞的很清楚
const REGEX_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function extractParamsText(fnOrStr: Function): string {
  if(!fnOrStr) return '';
  const fnText: string = (('string' === typeof fnOrStr) ? 
    fnOrStr : fnOrStr.toString()).replace(REGEX_COMMENTS, ''),
    argsTextMatch = fnText.match(REGEX_ARROW_ARG) || fnText.match(REGEX_FN_ARGS),
    argsText = (<any>argsTextMatch)[1];
  return argsText;
}

export function funcParamsParse(fn: Function): string[] {
  const argsText: string = extractParamsText(fn);
  const args: string[] = [];
  argsText.split(',').map(argName => {
    const match = argName.match(REGEX_FN_ARG)
    if(match) args.push((match as any)[2]);
  });
  return args;
}