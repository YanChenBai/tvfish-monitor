import { StatusBar } from '@capacitor/status-bar';
import isMobile from '@/utils/isMobile';
export default async function hideStatusBar() {
  if (isMobile()) {
    return setInterval(async () => {
      await StatusBar.hide();
      await StatusBar.setOverlaysWebView({ overlay: true });
    }, 5000);
  } else {
    return null;
  }
}
