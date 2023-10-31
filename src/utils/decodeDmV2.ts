import protobuf, { type INamespace } from 'protobufjs'

interface DmV2 {
  user: { face: string }
  color: number
}

const proto: INamespace = {
  nested: {
    UserInfo: {
      fields: {
        face: {
          type: 'string',
          id: 4,
        },
      },
    },
    DmV2: {
      fields: {
        color: {
          type: 'int64',
          id: 4,
        },
        user: {
          type: 'UserInfo',
          id: 20,
        },
      },
    },
  },
}

export function decodeDmV2(base64: string) {
  const root = protobuf.Root.fromJSON(proto)
  const dmV2 = root.lookupType('DmV2')

  const binaryData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const message = dmV2.toObject(dmV2.decode(binaryData)) as DmV2
  return message
}

export function getDanmuColoe(base64: string) {
  const dm = decodeDmV2(base64);
  return '#' + dm.color.toString(16)
}
