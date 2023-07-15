import { codingMessage, decodeMessage } from './douyu.codec.js';

const DoyuDanmu = class {
  roomId: number;
  ws: WebSocket | any;
  onMessage: any;
  info = null;
  timer: any;

  constructor(roomId: number, onMessage: any) {
    this.roomId = roomId;
    this.onMessage = onMessage;
  }

  async connect() {
    const { loginReqBuffer, joinGroupBuffer, heartbeatBuff } = this.encoding(
      this.roomId,
    );
    this.ws = new WebSocket('wss://danmuproxy.douyu.com:8506/');
    this.ws.onopen = () => {
      console.log(this.ws);
      console.log('连接成功！');
      this.ws.send(loginReqBuffer);
      setTimeout(() => {
        this.ws.send(joinGroupBuffer);
      }, 1000);

      this.timer = setInterval(() => {
        this.ws.send(heartbeatBuff);
      }, 45000);
    };

    this.ws.onmessage = (data: any) => {
      decodeMessage(data.data, this.onMessage);
    };

    this.ws.onclose = (msg: any) => {
      if (this.timer != null) {
        clearInterval(this.timer);
        this.timer = null;
      }
      console.log(msg);
    };
    this.ws.onerror = (msg: any) => console.log(msg);
  }

  encoding(roomId: number) {
    const loginReqStr = `type@=loginreq/roomid@=${roomId}/\0`;
    const loginReqBuffer = codingMessage(loginReqStr);

    const joinGroupStr = `type@=joingroup/rid@=${roomId}/gid@=-9999/\0`;
    const joinGroupBuffer = codingMessage(joinGroupStr);

    const heartbeatBuff = codingMessage('type@=mrkl/\0');
    return { loginReqBuffer, joinGroupBuffer, heartbeatBuff };
  }
};

export default DoyuDanmu;
