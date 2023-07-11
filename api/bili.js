const axios = require('axios');
const Config = require('./config.json');
const headers = Config.bilibli.headers;
const getResponseBody = require('./response.js');

let BiliLive = class {
  constructor(roomId) {
    this.roomId = roomId;
    this.params = Config.bilibli.getLiveInfoParams;
    this.getLiveInfoUrl = Config.bilibli.getLiveInfoUrl;
  }

  // 获取房间数据
  async getRoomInfo() {
    try {
      let res = await axios({
        method: 'GET',
        url: Config.bilibli.getRoomInfoUrl,
        params: {
          id: this.roomId,
        },
        headers,
      });
      if (res.data.code === 0) {
        return getResponseBody(200, '请求成功！', res.data.data);
      } else {
        return getResponseBody(500, '请求错误！');
      }
    } catch (err) {
      return getResponseBody(500, '请求错误！');
    }
  }

  // 获取直播源
  async getLiveInfo(qn = 10000, line = 0) {
    let res;
    let params = Config.bilibli.getLiveInfoParams;
    params.qn = qn;
    // 获取真实的房间ID
    let roomInfoRes = await this.getRoomInfo();

    if (roomInfoRes.code !== 200) {
      return roomInfoRes;
    }
    if (roomInfoRes.data['live_status'] !== 1) {
      return getResponseBody(-5, '房间未开播');
    }
    params['room_id'] = roomInfoRes.data['room_id'];

    try {
      res = await axios({
        method: 'GET',
        url: this.getLiveInfoUrl,
        params,
        headers,
      });
      res = res['data'];

      const codecIndex = 0;
      const { playurl_info } = res.data;

      // http_hls, http_stream
      const stream = playurl_info.playurl.stream.find(item => item.protocol_name === 'http_hls');
      const format = stream.format.find(item => item.format_name == 'ts');
      const codec = format.codec[codecIndex];
      const baseUrl = codec.base_url;
      const host = codec.url_info[line].host;
      const extra = codec.url_info[line].extra;
      const findQuality = playurl_info.playurl.g_qn_desc.filter(
        item => codec.accept_qn.indexOf(item.qn) !== -1
      );
      const quality = findQuality.map(item => ({
        qn: item.qn,
        name: item.desc,
      }));
      const lines = codec.url_info.map((item, index) => ({
        name: `线路${index + 1}`,
        line: index,
      }));

      return getResponseBody(200, '请求成功！', {
        url: host + baseUrl + extra,
        quality,
        qn: codec.current_qn,
        lines,
        line,
        format: format.format_name,
        codec: codec.codec_name,
      });
    } catch (e) {
      return getResponseBody(500, '请求错误！');
    }
  }

  // 获取主播信息
  async getUserInfo() {
    let roomInfo = await this.getRoomInfo();
    if (roomInfo.code !== 200) {
      return roomInfo;
    }
    let uid = roomInfo['data']['uid'];

    try {
      let userData = await axios.get(
        `https://api.live.bilibili.com/live_user/v1/Master/info?uid=${uid}`
      );

      if (userData.data.code === 0) {
        let user_info = {
          face: userData.data.data.info.face,
          name: userData.data.data.info.uname,
          title: userData.data.data.room_news.content,
        };
        roomInfo['data']['user_info'] = user_info;
        return roomInfo;
      } else {
        return getResponseBody(500, '请求错误！');
      }
    } catch (err) {
      return roomInfo;
      // return getResponseBody(500, "请求错误！");
    }
  }
};

module.exports = BiliLive;
