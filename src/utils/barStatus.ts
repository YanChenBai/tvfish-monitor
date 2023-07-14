import { StatusBar } from '@capacitor/status-bar';

export async function hideBar() {
  try {
    await StatusBar.hide();
    StatusBar.setOverlaysWebView({ overlay: true });
  } catch (error) {
    error;
  }
}

export async function showBar() {
  try {
    await StatusBar.show();
    StatusBar.setOverlaysWebView({ overlay: false });
  } catch (error) {
    error;
  }
}

export const autoHideBar = async () => {
  await hideBar();
  setInterval(async () => await hideBar(), 5000);
};
