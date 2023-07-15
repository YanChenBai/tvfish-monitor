const getResponseBody = require('./response.js');
const md5 = require('js-md5');
const axios = require('axios');
const { executeStrJs } = require('./tools.js');
const { getUserInfoDouyu } = require('./douyu_info.js');

// 获取真实url
async function getRealUrl(roomId, qn = null, line = null) {
  const did = '10000000000000000000000000001501';
  const t10 = parseInt(new Date().getTime() / 1000).toString();
  const _t13 = new Date().getTime().toString();
  const cdn = 'ws-h5';
  const rate = 0;
  if (!qn) {
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
  const roomInfo = await getUserInfoDouyu(roomId);
  const realId = roomInfo.data.roomId;

  const res = await axios.get('https://www.douyu.com/' + realId);
  const result = res.data.match(
    /(vdwdae325w_64we[\s\S]*function ub98484234[\s\S]*?)function/,
  );
  const func_ub9 = result[1].replace(/eval.*?;}/g, 'strc;}');

  let fun = executeStrJs(func_ub9, ['ub98484234']);
  const js_res = fun.ub98484234();

  const v = js_res.match(/v=(\d+)/)[1];
  const rb = md5(`${realId}${did}${t10}${v}`);

  let func_sign = js_res.replace(/return rt;}\);?/g, 'return rt;}');
  func_sign = func_sign.replace('(function (', 'function sign(');
  func_sign = func_sign.replace('CryptoJS.MD5(cb).toString()', '"' + rb + '"');

  fun = executeStrJs(func_sign, ['sign']);
  let params = fun.sign(realId, did, t10);
  params += `&cdn=${line}&rate=${qn}`;

  const url = `https://www.douyu.com/lapi/live/getH5Play/${realId}?${params}`;
  const resInfo = await axios({ method: 'POST', url });

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
    return getResponseBody(200, '请求成功！', reqData);
  } else if (resInfo.data.error === -5) {
    return getResponseBody(-5, '房间未开播！', roomInfo.data);
  } else {
    return getResponseBody(500, '请求错误！', res);
  }
}

module.exports = {
  getRealUrl,
};
