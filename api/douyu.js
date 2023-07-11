const md5 = require('js-md5');
const axios = require('axios');
const { executeStrJs } = require('./tools.js');
const Config = require('./config.json');
const getResponseBody = require('./response.js');
const headers = Config.bilibli.headers;

const DouyuLive = class {
  constructor(roomId, rate = 0) {
    this.did = '10000000000000000000000000001501';
    this.t10 = parseInt(new Date().getTime() / 1000).toString();
    this.t13 = new Date().getTime().toString();
    this.roomId = roomId;
    this.cdn = 'ws-h5';
    this.rate = rate;
  }

  // 获取直播间状态
  async get_pre() {
    let url = 'https://playweb.douyucdn.cn/lapi/live/hlsH5Preview/' + this.roomId;
    let data = { rid: this.roomId, did: this.did };
    let auth = md5(`${this.roomId}${this.t13}`);
    let headers = { rid: this.roomId, time: this.t13, auth };
    let res = await axios({
      method: 'POST',
      headers,
      url,
      data,
    });
    let key = '';
    let error = res.data.error;
    let params = res.data.data;
    if (params) {
      let rtmp_live = params.rtmp_live;
      key = rtmp_live.match(/(\d{1,8}[0-9a-zA-Z]+)_?\d{0,4}(\/playlist|.m3u8)/)[1];
    }
    return { key, error };
  }

  // 获取真实id
  async getRealId() {
    let res;
    try {
      res = await axios.get('https://m.douyu.com/' + this.roomId);
      res = res.data;
      let tmp_str = res.toString().match(/"rid":(\d{1,8}),"vipId"/g);
      if (tmp_str) {
        this.roomId = JSON.parse(`{${tmp_str}:123}`).rid;
        return getResponseBody(200, '请求成功!', this.roomId);
      } else {
        return getResponseBody(500, '房间号错误!');
      }
    } catch (err) {
      return getResponseBody(500, '请求失败!');
    }
  }

  // 获取真实url
  async getRealUrl() {
    `
    通过PC网页端的接口获取完整直播源。
    :param cdn: 主线路ws-h5、备用线路tct-h5
    :param rate: 1流畅；2高清；3超清；4蓝光4M；0蓝光8M或10M
    :return: JSON格式
    `;
    let res = await axios.get('https://www.douyu.com/' + this.roomId);
    let result = res.data.match(/(vdwdae325w_64we[\s\S]*function ub98484234[\s\S]*?)function/);
    let func_ub9 = result[1].replace(/eval.*?;}/g, 'strc;}');

    let fun = executeStrJs(func_ub9, ['ub98484234']);
    let js_res = fun.ub98484234();

    let v = js_res.match(/v=(\d+)/)[1];
    let rb = md5(`${this.roomId}${this.did}${this.t10}${v}`);

    let func_sign = js_res.replace(/return rt;}\);?/g, 'return rt;}');
    func_sign = func_sign.replace('(function (', 'function sign(');
    func_sign = func_sign.replace('CryptoJS.MD5(cb).toString()', '"' + rb + '"');

    fun = executeStrJs(func_sign, ['sign']);
    let params = fun.sign(this.roomId, this.did, this.t10);
    params += `&cdn=${this.cdn}&rate=${this.rate}`;
    let url = `https://www.douyu.com/lapi/live/getH5Play/${this.roomId}?${params}`;
    res = await axios({ method: 'POST', url, headers });

    if (res.data.error === 0) {
      let data = res.data.data;
      let liveUrl = `${data['rtmp_url']}/${data['rtmp_live']}`;
      let quality = [];
      for (let item of data['multirates']) {
        quality.push({
          name: item.name,
          url: `${item.rate}`,
          type: 'flv',
        });
      }

      let info = {
        quality,
        url: liveUrl,
        line: data['rtmp_cdn'],
        qn: data['rate'],
        lines: data['cdnsWithName'],
        quality: data['multirates'],
      };
      return getResponseBody(200, '请求成功！', info);
    } else if (res.data.error === -5) {
      return getResponseBody(-5, '房间未开播！');
    } else {
      return getResponseBody(500, '请求错误！', res);
    }
  }

  // 获取主播信息
  async getUserInfo() {
    try {
      let realIdDataRes = await this.getRealId();
      if (realIdDataRes.code !== 200) {
        return getResponseBody(500, '请求错误！');
      }
      let data = await axios({
        headers,
        method: 'get',
        url: `https://www.douyu.com/swf_api/h5room/${this.roomId}`,
      });
      data.data.data['room_id'] = this.roomId;
      return getResponseBody(200, '请求成功！', data.data.data);
    } catch (err) {
      return getResponseBody(500, '请求错误！', err);
    }
  }

  // 获取直播源信息
  async getLiveInfo() {
    let roomIdData = await this.getRealId();
    if (roomIdData.code === 200) {
      try {
        return await this.getRealUrl();
      } catch (err) {
        return getResponseBody(500, '请求错误！', err);
      }
    } else {
      return roomIdData;
    }
  }
};
module.exports = DouyuLive;
