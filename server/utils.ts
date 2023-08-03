// 字符串js导出函数
export function executeStrJs(str: string, out_function: string[] = []) {
  const strFunction = new Function(
    'exports',
    'module',
    'require',
    `
        ${str}
        module.exports = {
            ${out_function.join(',')}
        }
    `,
  );
  const executeModule = { exports: {} };
  strFunction(executeModule.exports, executeModule, () => ({}));

  return executeModule.exports;
}

export function getResponseBody<T = any>(
  code: number,
  message: string,
  data: T | null = null,
) {
  return {
    code: code,
    data: data,
    message: message,
  };
}
