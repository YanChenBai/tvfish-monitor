import { getResponseBody } from '../utils';
import axios, { AxiosResponse } from 'axios';

interface RoomByUid {
  title: string;
  room_id: number;
  uid: number;
  online: number;
  live_time: number;
  live_status: number;
  short_id: number;
  area: number;
  area_name: string;
  area_v2_id: number;
  area_v2_name: string;
  area_v2_parent_name: string;
  area_v2_parent_id: number;
  uname: string;
  face: string;
  tag_name: string;
  tags: string;
  cover_from_user: string;
  keyframe: string;
  lock_till: string;
  hidden_till: string;
  broadcast_type: number;
}

interface RoomByUids {
  [key: string]: RoomByUid;
}

// 获取用户信息
export async function getUserInfo(rooomId: string) {
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
export async function getRoomInfo(roomId: string) {
  const res = await axios({
    method: 'GET',
    url: 'https://api.live.bilibili.com/room/v1/Room/get_info',
    params: {
      id: roomId,
    },
  });
  const {
    room_id,
    live_status,
    title,
    keyframe,
    uid,
    short_id,
    tags,
    live_time,
  } = res.data.data;
  if (res.data.code === 0) {
    return {
      uid,
      roomId: room_id,
      shortId: short_id,
      status: live_status,
      title,
      keyframe,
      tags,
      liveTime: new Date(live_time).getTime(),
    };
  } else {
    throw new Error('请求错误');
  }
}

// 批量获取房间数据
export async function getRoomInfoMany(uids: string[]) {
  try {
    const res = await axios.get<any, AxiosResponse<{ data: RoomByUids }>>(
      `https://api.live.bilibili.com/room/v1/Room/get_status_info_by_uids`,
      {
        params: { uids },
      },
    );
    const data = res.data.data;
    const rooms: any = {};
    for (const key in data) {
      const {
        face,
        uname,
        room_id,
        short_id,
        live_status,
        title,
        keyframe,
        tags,
        uid,
      } = data[key];
      rooms[room_id] = {
        uid,
        face,
        name: uname,
        platform: 'bili',
        roomId: room_id,
        shortId: short_id,
        status: live_status,
        title,
        keyframe,
        tags,
        liveTime: null,
      };
    }
    return getResponseBody(200, 'Ok.', rooms);
  } catch (error) {
    return getResponseBody(500, '请求错误！');
  }
}
