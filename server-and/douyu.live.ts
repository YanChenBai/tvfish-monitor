import getResponseBody from './response';
import { CapacitorHttp } from '@capacitor/core';
import { executeStrJs } from './tools';
import md5 from 'js-md5';
import { getUserInfoDouyu } from './douyu.info';

// 获取真实url
async function getRealUrl(roomId: any, qn: any = null, line: any = null) {
  const did = '10000000000000000000000000001501';
  const t10 = (new Date().getTime() / 1000).toFixed(0).toString();
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
  const realId = roomInfo.data.room_id;

  const res = await CapacitorHttp.get({
    url: 'https://www.douyu.com/' + realId,
  });
  const result = res.data.match(
    /(vdwdae325w_64we[\s\S]*function ub98484234[\s\S]*?)function/,
  );
  const func_ub9: any = result[1].replace(/eval.*?;}/g, 'strc;}');

  let fun: any = executeStrJs(func_ub9, ['ub98484234']);
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
  const resInfo = await CapacitorHttp.post({ url });

  if (resInfo.data.error === 0) {
    const data = resInfo.data.data;
    const liveUrl = `${data['rtmp_url']}/${data['rtmp_live']}`;
    const quality: any[] = [];
    for (const item of data['multirates']) {
      quality.push({
        name: item.name,
        qn: item.rate,
      });
    }
    const lines = data['cdnsWithName'].map((item: any) => ({
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

export { getRealUrl };
