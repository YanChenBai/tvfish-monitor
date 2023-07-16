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

    this.ws.onclose = () => this.close();
    this.ws.onerror = () => ({});
    return {};
  }

  close() {
    if (this.ws) this.ws.close();
    this.ws = null;
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
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
