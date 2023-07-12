let textDecoder = new TextDecoder('utf8');

// 数据编码
function codingMessage(str: string) {
  //仿照 ws里边的 16位数据生成
  let len = str.length;
  let buffer = new ArrayBuffer(len + 12);
  new DataView(buffer).setInt16(0, len + 8, true);
  new DataView(buffer).setInt16(4, len + 8, true);
  new DataView(buffer).setInt16(8, 45314, false);
  let bufView = new Uint8Array(buffer, 12);
  for (var i = 0; i < len; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buffer;
}

// 消息解码
function decodeMessage(blob: Blob, onMessage = (_msg: string) => {}) {
  let reader = new FileReader();
  reader.onload = (e: any) => {
    try {
      let buffer = new Uint8Array(e.target.result);
      let msg_len = new Uint32Array(buffer.slice(0, 4).buffer)[0];
      let msgStr = textDecoder.decode(buffer.slice(12, msg_len + 4));
      const msg_array: any = msgStr.toString().match(/(type@=.*?)\x00/g);
      msg_array.forEach((msg: any) => {
        msg = msg.replace(/@=/g, '":"');
        msg = msg.replace(/\//g, '","');
        msg = msg.substring(0, msg.length - 3);
        msg = JSON.parse(`{"${msg}}`);
        if (msg.type === 'chatmsg') {
          // let data = {
          //   uid: msg["uid"],
          //   user: msg["nn"],
          //   content: msg["txt"],
          // };
          onMessage(msg['txt']);
        }
      });
    } catch (error) {}
  };
  reader.readAsArrayBuffer(blob);
}

export { decodeMessage, codingMessage };
