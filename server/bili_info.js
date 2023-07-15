const getResponseBody = require('./response.js');
const axios = require('axios');

// 获取用户信息
async function getUserInfo(rooomId) {
  try {
    const res = await getRoomInfo(rooomId);
    const userData = await axios.get(
      `https://api.live.bilibili.com/live_user/v1/Master/info?uid=${res.data.uid}`,
    );
    const data = userData.data.data;

    if (userData.data.code === 0) {
      const user_info = {
        face: data.info.face,
        name: data.info.uname,
        news: data.room_news.content,
      };
      return getResponseBody(200, 'Ok.', { ...user_info, ...res.data });
    } else {
      return getResponseBody(500, '请求错误！');
    }
  } catch (e) {
    return getResponseBody(500, '请求错误！');
  }
}

// 获取房间数据
async function getRoomInfo(roomId) {
  try {
    const res = await axios({
      method: 'GET',
      url: 'https://api.live.bilibili.com/room/v1/Room/get_info',
      params: {
        id: roomId,
      },
    });
    const { uid, room_id, live_status, title, keyframe } = res.data.data;
    if (res.data.code === 0) {
      return getResponseBody(200, '请求成功！', {
        uid,
        room_id,
        live_status,
        title,
        keyframe,
      });
    } else {
      return getResponseBody(500, '请求错误！');
    }
  } catch (err) {
    return getResponseBody(500, '请求错误！');
  }
}

module.exports = {
  getUserInfo,
  getRoomInfo,
};
