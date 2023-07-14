import getResponseBody from './response';
import { CapacitorHttp } from '@capacitor/core';
import { getUserInfo } from './bili.info';

const defParams = {
  protocol: '0,1',
  format: '0,1,2',
  codec: '0,1',
  qn: 10000,
  platform: 'h5',
  ptype: 8,
};

// 获取直播源
async function getLiveInfo(roomId: any, qn = 10000, line = 0) {
  let res;
  const params: any = { ...defParams };
  if (line === null) {
    line = 0;
  }
  if (qn !== null) {
    params.qn = qn;
  } else {
    params.qn = 10000;
  }

  // 获取真实的房间ID
  const roomInfoRes = await getUserInfo(roomId);
  if (roomInfoRes.code !== 200) {
    return roomInfoRes;
  }
  if (roomInfoRes.data['live_status'] !== 1) {
    return getResponseBody(-5, '房间未开播', roomInfoRes.data);
  }

  params['room_id'] = roomInfoRes.data['room_id'];

  try {
    res = await CapacitorHttp.get({
      url: 'https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo',
      params: params,
    });

    const codecIndex = 0;
    const { playurl_info } = res.data.data;

    // http_hls, http_stream
    const stream = playurl_info.playurl.stream.find(
      (item: any) => item.protocol_name === 'http_hls',
    );
    const format = stream.format.find((item: any) => item.format_name == 'ts');
    const codec = format.codec[codecIndex];
    const baseUrl = codec.base_url;
    const host = codec.url_info[line].host;
    const extra = codec.url_info[line].extra;
    const findQuality = playurl_info.playurl.g_qn_desc.filter(
      (item: any) => codec.accept_qn.indexOf(item.qn) !== -1,
    );
    const quality = findQuality.map((item: any) => ({
      qn: item.qn,
      name: item.desc,
    }));
    const lines = codec.url_info.map((item: any, index: any) => ({
      name: `线路${index + 1}`,
      line: index,
    }));

    return getResponseBody(200, '请求成功！', {
      url: host + baseUrl + extra,
      quality,
      qn: codec.current_qn,
      lines,
      line,
      // format: format.format_name,
      // codec: codec.codec_name,
      info: roomInfoRes.data,
    });
  } catch (e) {
    return getResponseBody(500, '请求错误！');
  }
}

export { getLiveInfo };
