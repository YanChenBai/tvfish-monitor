import { codingMessage, decodeMessage } from './douyu.codec.js';

const DoyuDanmu = class {
  roomId: string;
  ws: WebSocket | null = null;
  onMessage: any;
  info = null;
  timer: any;

  constructor(roomId: string, onMessage: any) {
    this.roomId = roomId;
    this.onMessage = onMessage;
  }

  async connect() {
    let { loginReqBuffer, joinGroupBuffer, heartbeatBuff } = this.encoding(
      this.roomId,
    );
    this.ws = new WebSocket('wss://danmuproxy.douyu.com:8506/');
    this.ws.onopen = () => {
      console.log(this.ws);
      console.log('连接成功！');
      this.ws!.send(loginReqBuffer);
      setTimeout(() => {
        this.ws!.send(joinGroupBuffer);
      }, 1000);

      this.timer = setInterval(() => {
        this.ws!.send(heartbeatBuff);
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

  encoding(roomId: string) {
    let loginReqStr = `type@=loginreq/roomid@=${roomId}/\0`;
    let loginReqBuffer = codingMessage(loginReqStr);

    let joinGroupStr = `type@=joingroup/rid@=${roomId}/gid@=-9999/\0`;
    let joinGroupBuffer = codingMessage(joinGroupStr);

    let heartbeatBuff = codingMessage('type@=mrkl/\0');
    return { loginReqBuffer, joinGroupBuffer, heartbeatBuff };
  }
};

export default DoyuDanmu;
