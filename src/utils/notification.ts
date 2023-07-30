import { LocalNotifications } from '@capacitor/local-notifications';

let msgId = 0;
export async function notification(title: string, body: string) {
  const res = await LocalNotifications.schedule({
    notifications: [
      {
        title,
        body,
        id: msgId++,
      },
    ],
  });
  return res;
}
