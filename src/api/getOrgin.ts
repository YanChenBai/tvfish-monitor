export async function getOrgin(roomId: number, type: string): Promise<any> {
  const res = await fetch(
    `http://139.159.151.227:9889/getLiveInfo?roomid=${roomId}&type=${type}&rate=0`,
  );
  const data = (await res.json()) as {
    data: { url: string; nowUrl: string };
  };
  return data.data;
}
