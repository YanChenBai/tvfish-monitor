import { StatusBar } from '@capacitor/status-bar';

export async function hideBar() {
  await StatusBar.hide();
  StatusBar.setOverlaysWebView({ overlay: true });
}

export async function showBar() {
  await StatusBar.show();
  StatusBar.setOverlaysWebView({ overlay: false });
}
