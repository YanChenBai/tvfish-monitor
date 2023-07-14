const getResponseBody = require('./response.js');
const axios = require('axios');

// 获取真实id
async function getRealId(roomId) {
  let res = await axios.get('https://m.douyu.com/' + roomId);
  res = res.data;
  const tmp_str = res.toString().match(/"rid":(\d{1,8}),"vipId"/g);
  if (tmp_str) {
    const realId = JSON.parse(`{${tmp_str}:123}`).rid;
    return realId;
  } else {
    return null;
  }
}

// 获取主播信息
async function getUserInfoDouyu(roomId) {
  try {
    const realId = await getRealId(roomId);
    if (realId === null) return getResponseBody(404, '没找到对应主播！');

    const res = await axios({
      method: 'get',
      url: `https://www.douyu.com/swf_api/h5room/${realId}`,
    });
    const data = res.data.data;
    const reqData = {
      face: data.owner_avatar,
      news: data.show_details,
      name: data.nickname,
      uid: data.owner_uid,
      room_id: data.room_id,
      short_id: roomId,
      live_status: data.show_status,
      title: data.room_name,
      keyframe: data.room_src,
    };
    return getResponseBody(200, '请求成功！', reqData);
  } catch (err) {
    return getResponseBody(500, '请求错误！', err);
  }
}

module.exports = {
  getRealId,
  getUserInfoDouyu,
};
