// 字符串js导出函数
function executeStrJs(str, out_function = []) {
  let strFunction = new Function(
    'exports',
    'module',
    'require',
    `
        ${str}
        module.exports = {
            ${out_function.join(',')}
        }
    `
  );
  let executeModule = { exports: {} };
  strFunction(executeModule.exports, executeModule, () => {});

  return executeModule.exports;
}

module.exports = {
  executeStrJs,
};
