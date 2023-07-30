import { toastController } from '@ionic/vue';

export async function message(msg: string, duration = 1000) {
  const toast = await toastController.create({
    message: msg,
    duration,
    position: 'top',
  });
  await toast.present();
}
