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
      url: `https://www.douyu.com/betard/${realId}`,
    });
    const data = res.data.room;
    let status = 0;
    if (data.show_status === 2) {
      status === 0;
    } else if (data.show_status === 1) {
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
