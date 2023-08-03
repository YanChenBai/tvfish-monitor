"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfoDouyu = exports.getRealId = void 0;
const utils_1 = require("../utils");
const axios_1 = __importDefault(require("axios"));
// 获取真实id
async function getRealId(roomId) {
    let res = await axios_1.default.get('https://m.douyu.com/' + roomId);
    res = res.data;
    const tmp_str = res.toString().match(/"rid":(\d{1,8}),"vipId"/g);
    if (tmp_str) {
        const realId = JSON.parse(`{${tmp_str}:123}`).rid;
        return realId;
    }
    else {
        return null;
    }
}
exports.getRealId = getRealId;
// 获取主播信息
async function getUserInfoDouyu(roomId) {
    try {
        const realId = await getRealId(roomId);
        if (realId === null)
            return (0, utils_1.getResponseBody)(404, '没找到对应主播！');
        const res = await (0, axios_1.default)({
            method: 'get',
            url: `https://www.douyu.com/betard/${realId}`,
        });
        const data = res.data.room;
        let status = 0;
        if (data.show_status === 2) {
            status === 0;
        }
        else if (data.show_status === 1) {
            status = data.videoLoop === 1 ? 2 : 1;
        }
        const reqData = {
            face: data.owner_avatar,
            news: data.show_details,
            name: data.nickname,
            roomId: Number(data.room_id),
            shortId: data.vipId,
            status,
            title: data.room_name,
            keyframe: data.room_pic,
            platform: 'douyu',
            tags: data.authInfo.desc,
            liveTime: data.show_time * 1000,
        };
        return (0, utils_1.getResponseBody)(200, '请求成功！', reqData);
    }
    catch (err) {
        return (0, utils_1.getResponseBody)(500, '请求错误！', err);
    }
}
exports.getUserInfoDouyu = getUserInfoDouyu;
//# sourceMappingURL=info.js.map