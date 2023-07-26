export function stringToByte(str: string) {
  // eslint-disable-next-line no-array-constructor
  const bytes: number[] = [],
    len = str.length;
  let c: number;
  for (let i = 0; i < len; i++) {
    c = String(str).charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10ffff) {
      bytes.push(((c >> 18) & 0x07) | 0xf0);
      bytes.push(((c >> 12) & 0x3f) | 0x80);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00ffff) {
      bytes.push(((c >> 12) & 0x0f) | 0xe0);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007ff) {
      bytes.push(((c >> 6) & 0x1f) | 0xc0);
      bytes.push((c & 0x3f) | 0x80);
    } else {
      bytes.push(c & 0xff);
    }
  }
  return bytes;
}

// 消息体打包
export function WebSocket_Packet(str: string) {
  const MSG_TYPE = 689;
  const bytesArr = stringToByte(str);
  const buffer = new Uint8Array(bytesArr.length + 4 + 4 + 2 + 1 + 1 + 1);
  const p_content = new Uint8Array(bytesArr.length); // 消息内容
  for (let i = 0; i < p_content.length; i++) {
    p_content[i] = bytesArr[i];
  }
  const p_length = new Uint32Array([bytesArr.length + 4 + 2 + 1 + 1 + 1]); // 消息长度
  const p_type = new Uint32Array([MSG_TYPE]); // 消息类型

  buffer.set(new Uint8Array(p_length.buffer), 0);
  buffer.set(new Uint8Array(p_length.buffer), 4);
  buffer.set(new Uint8Array(p_type.buffer), 8);
  buffer.set(p_content, 12);

  return buffer;
}

export function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export function getStrMiddle(
  str: string,
  before: string,
  after: string,
): string {
  const m = str.match(new RegExp(before + '(.*?)' + after));
  return m ? m[1] : '';
}

export class Ex_WebSocket_UnLogin {
  timer: number;
  ws: WebSocket;
  constructor(rid: number, msgHandler: { (str: string): void }) {
    this.timer = 0;
    this.ws = new WebSocket(
      'wss://danmuproxy.douyu.com:850' + String(getRandom(2, 5)),
    ); // 负载均衡 8502~8504都可以用
    this.ws.onopen = () => {
      this.ws.send(WebSocket_Packet('type@=loginreq/roomid@=' + rid));
      this.ws.send(
        WebSocket_Packet('type@=joingroup/rid@=' + rid + '/gid@=-9999/'),
      );
      // this.ws.send(WebSocket_Packet("type@=sub/mt@=asr_caption/"));
      this.timer = setInterval(() => {
        this.ws.send(WebSocket_Packet('type@=mrkl/'));
      }, 40000);
    };
    this.ws.onerror = () => {
      //
    };
    this.ws.onmessage = (e) => {
      let reader: FileReader | null = new FileReader();
      reader.onload = () => {
        if (reader === null) return;
        const arr: string[] = String(reader.result).split('\0'); // 分包
        reader = null;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].length > 12) {
            // 过滤第一条和心跳包
            msgHandler(arr[i]);
          }
        }
      };
      reader.readAsText(e.data);
    };
    this.ws.onclose = () => {
      //
    };
  }
  close() {
    clearInterval(this.timer);
    this.ws.close();
  }
}
