import { getResponseBody } from '../utils';
import { getUserInfo } from './info';
import axios from 'axios';

const defParams = {
  protocol: '0,1',
  format: '2',
  codec: '0',
  qn: 10000,
  platform: 'h5',
  ptype: 8,
  room_id: '',
};

// 获取直播源
export async function getLiveInfo(roomId: string, qn = 150, line = 0) {
  let res;
  const params = { ...defParams };
  if (line === null) {
    line = 0;
  }
  if (qn !== null) {
    params.qn = qn;
  } else {
    params.qn = 150;
  }

  // 获取真实的房间ID
  const roomInfoRes = await getUserInfo(roomId);
  // console.log(roomInfoRes);
  if (roomInfoRes.code !== 200) {
    throw new Error('请求错误!');
  }
  if (roomInfoRes.data.status !== 1) {
    return getResponseBody(-5, '房间未开播', roomInfoRes.data);
  }

  params['room_id'] = roomInfoRes.data.roomId;
  try {
    res = await axios({
      method: 'GET',
      url: 'https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo',
      params,
    });

    const codecIndex = 0;
    const streamIndex = 0;
    const formatIndex = 0;
    const { playurl_info } = res.data.data;

    // http_hls, http_stream
    const stream = playurl_info.playurl.stream[streamIndex];
    const format = stream.format[formatIndex];
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
    const lines = codec.url_info.map((_item: any, index: number) => ({
      name: `线路${index + 1}`,
      line: index,
    }));

    return getResponseBody(200, '请求成功！', {
      url: host + baseUrl + extra,
      quality,
      qn: codec.current_qn,
      lines,
      line,
      info: roomInfoRes.data,
    });
  } catch (e) {
    return getResponseBody(500, '请求错误！');
  }
}
