"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealUrl = void 0;
const js_md5_1 = __importDefault(require("js-md5"));
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../utils");
const info_1 = require("./info");
// 获取真实url
async function getRealUrl(roomId, qn = null, line = null) {
    const did = '10000000000000000000000000001501';
    const t10 = (new Date().getTime() / 1000).toFixed(0);
    // const _t13 = new Date().getTime().toString();
    const cdn = 'ws-h5';
    const rate = 2;
    if (qn === null) {
        qn = rate;
    }
    if (!line) {
        line = cdn;
    }
    `
  通过PC网页端的接口获取完整直播源。
  :param cdn: 主线路ws-h5、备用线路tct-h5
  :param rate: 1流畅；2高清；3超清；4蓝光4M；0蓝光8M或10M
  :return: JSON格式
  `;
    const roomInfo = await (0, info_1.getUserInfoDouyu)(roomId);
    const realId = roomInfo.data.roomId;
    const res = await axios_1.default.get('https://www.douyu.com/' + realId);
    const result = res.data.match(/(vdwdae325w_64we[\s\S]*function ub98484234[\s\S]*?)function/);
    const func_ub9 = result[1].replace(/eval.*?;}/g, 'strc;}');
    let fun = (0, utils_1.executeStrJs)(func_ub9, ['ub98484234']);
    const js_res = fun.ub98484234();
    const v = js_res.match(/v=(\d+)/)[1];
    const rb = (0, js_md5_1.default)(`${realId}${did}${t10}${v}`);
    let func_sign = js_res.replace(/return rt;}\);?/g, 'return rt;}');
    func_sign = func_sign.replace('(function (', 'function sign(');
    func_sign = func_sign.replace('CryptoJS.MD5(cb).toString()', '"' + rb + '"');
    fun = (0, utils_1.executeStrJs)(func_sign, ['sign']);
    let params = fun.sign(realId, did, t10);
    params += `${line === null ? '' : '&cdn=' + line}${qn === null ? '' : '&rate=' + qn}`;
    const url = `https://www.douyu.com/lapi/live/getH5Play/${realId}?${params}`;
    const resInfo = await (0, axios_1.default)({ method: 'POST', url });
    if (resInfo.data.error === 0) {
        const data = resInfo.data.data;
        const liveUrl = `${data['rtmp_url']}/${data['rtmp_live']}`;
        const quality = [];
        for (const item of data['multirates']) {
            quality.push({
                name: item.name,
                qn: item.rate,
            });
        }
        const lines = data['cdnsWithName'].map((item) => ({
            name: item.name,
            line: item.cdn,
        }));
        const reqData = {
            quality,
            url: liveUrl,
            line: data['rtmp_cdn'],
            qn: data['rate'],
            lines,
            info: roomInfo.data,
        };
        return (0, utils_1.getResponseBody)(200, '请求成功！', reqData);
    }
    else if (resInfo.data.error === -5) {
        return (0, utils_1.getResponseBody)(-5, '房间未开播！', roomInfo.data);
    }
    else {
        return (0, utils_1.getResponseBody)(500, '请求错误！', res);
    }
}
exports.getRealUrl = getRealUrl;
//# sourceMappingURL=live.js.map