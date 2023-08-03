"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResponseBody = exports.executeStrJs = void 0;
// 字符串js导出函数
function executeStrJs(str, out_function = []) {
    const strFunction = new Function('exports', 'module', 'require', `
        ${str}
        module.exports = {
            ${out_function.join(',')}
        }
    `);
    const executeModule = { exports: {} };
    strFunction(executeModule.exports, executeModule, () => ({}));
    return executeModule.exports;
}
exports.executeStrJs = executeStrJs;
function getResponseBody(code, message, data = null) {
    return {
        code: code,
        data: data,
        message: message,
    };
}
exports.getResponseBody = getResponseBody;
//# sourceMappingURL=utils.js.map