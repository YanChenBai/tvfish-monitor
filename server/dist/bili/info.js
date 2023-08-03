"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = void 0;
const utils_1 = require("../utils");
const axios_1 = __importDefault(require("axios"));
// 获取用户信息
async function getUserInfo(rooomId) {
    try {
        const roomInfo = await getRoomInfo(rooomId);
        const userData = await axios_1.default.get(`https://api.live.bilibili.com/live_user/v1/Master/info?uid=${roomInfo.uid}`);
        const data = userData.data.data;
        if (userData.data.code === 0) {
            const user_info = {
                face: data.info.face,
                name: data.info.uname,
                news: data.room_news.content,
                platform: 'bili',
            };
            delete roomInfo['uid'];
            return (0, utils_1.getResponseBody)(200, 'Ok.', { ...user_info, ...roomInfo });
        }
        else {
            return (0, utils_1.getResponseBody)(500, '请求错误！');
        }
    }
    catch (e) {
        // console.log(e);
        return (0, utils_1.getResponseBody)(500, '请求错误！');
    }
}
exports.getUserInfo = getUserInfo;
// 获取房间数据
async function getRoomInfo(roomId) {
    const res = await (0, axios_1.default)({
        method: 'GET',
        url: 'https://api.live.bilibili.com/room/v1/Room/get_info',
        params: {
            id: roomId,
        },
    });
    const { room_id, live_status, title, keyframe, uid, short_id, tags, live_time, } = res.data.data;
    if (res.data.code === 0) {
        return {
            uid,
            roomId: room_id,
            shortId: short_id,
            status: live_status,
            title,
            keyframe,
            tags,
            liveTime: new Date(live_time).getTime(),
        };
    }
    else {
        throw new Error('请求错误');
    }
}
//# sourceMappingURL=info.js.map