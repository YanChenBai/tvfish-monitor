import { toastController } from '@ionic/vue';

export async function message(msg: string) {
  const toast = await toastController.create({
    message: msg,
    duration: 1000,
    position: 'top',
  });
  await toast.present();
}
