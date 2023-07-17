const getResponseBody = require('./response.js');
const axios = require('axios');

// 获取用户信息
async function getUserInfo(rooomId) {
  try {
    const roomInfo = await getRoomInfo(rooomId);
    const userData = await axios.get(
      `https://api.live.bilibili.com/live_user/v1/Master/info?uid=${roomInfo.uid}`,
    );
    const data = userData.data.data;

    if (userData.data.code === 0) {
      const user_info = {
        face: data.info.face,
        name: data.info.uname,
        news: data.room_news.content,
        platform: 'bili',
      };
      delete roomInfo['uid'];
      return getResponseBody(200, 'Ok.', { ...user_info, ...roomInfo });
    } else {
      return getResponseBody(500, '请求错误！');
    }
  } catch (e) {
    // console.log(e);
    return getResponseBody(500, '请求错误！');
  }
}

// 获取房间数据
async function getRoomInfo(roomId) {
  const res = await axios({
    method: 'GET',
    url: 'https://api.live.bilibili.com/room/v1/Room/get_info',
    params: {
      id: roomId,
    },
  });
  const { room_id, live_status, title, keyframe, uid, short_id } =
    res.data.data;
  if (res.data.code === 0) {
    return {
      uid,
      roomId: room_id,
      shortId: short_id,
      status: live_status,
      title,
      keyframe,
    };
  } else {
    throw new Error('请求错误');
  }
}

module.exports = {
  getUserInfo,
};
