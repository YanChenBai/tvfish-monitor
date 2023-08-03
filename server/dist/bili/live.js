"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiveInfo = void 0;
const utils_1 = require("../utils");
const info_1 = require("./info");
const axios_1 = __importDefault(require("axios"));
const defParams = {
    protocol: '0,1',
    format: '2',
    codec: '0',
    qn: 10000,
    platform: 'h5',
    ptype: 8,
    room_id: '',
};
// 获取直播源
async function getLiveInfo(roomId, qn = 150, line = 0) {
    let res;
    const params = { ...defParams };
    if (line === null) {
        line = 0;
    }
    if (qn !== null) {
        params.qn = qn;
    }
    else {
        params.qn = 150;
    }
    // 获取真实的房间ID
    const roomInfoRes = await (0, info_1.getUserInfo)(roomId);
    // console.log(roomInfoRes);
    if (roomInfoRes.code !== 200) {
        throw new Error('请求错误!');
    }
    if (roomInfoRes.data.status !== 1) {
        return (0, utils_1.getResponseBody)(-5, '房间未开播', roomInfoRes.data);
    }
    params['room_id'] = roomInfoRes.data.roomId;
    try {
        res = await (0, axios_1.default)({
            method: 'GET',
            url: 'https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo',
            params,
        });
        const codecIndex = 0;
        const streamIndex = 0;
        const formatIndex = 0;
        const { playurl_info } = res.data.data;
        // http_hls, http_stream
        const stream = playurl_info.playurl.stream[streamIndex];
        const format = stream.format[formatIndex];
        const codec = format.codec[codecIndex];
        const baseUrl = codec.base_url;
        const host = codec.url_info[line].host;
        const extra = codec.url_info[line].extra;
        const findQuality = playurl_info.playurl.g_qn_desc.filter((item) => codec.accept_qn.indexOf(item.qn) !== -1);
        const quality = findQuality.map((item) => ({
            qn: item.qn,
            name: item.desc,
        }));
        const lines = codec.url_info.map((_item, index) => ({
            name: `线路${index + 1}`,
            line: index,
        }));
        return (0, utils_1.getResponseBody)(200, '请求成功！', {
            url: host + baseUrl + extra,
            quality,
            qn: codec.current_qn,
            lines,
            line,
            info: roomInfoRes.data,
        });
    }
    catch (e) {
        return (0, utils_1.getResponseBody)(500, '请求错误！');
    }
}
exports.getLiveInfo = getLiveInfo;
//# sourceMappingURL=live.js.map