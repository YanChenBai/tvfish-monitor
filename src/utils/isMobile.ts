import { getPlatforms, Platforms } from '@ionic/vue';

const phone: Platforms[] = [
  'android',
  'capacitor',
  'cordova',
  'hybrid',
  'ios',
  'ipad',
  'iphone',
  'phablet',
];

const exclude: Platforms[] = ['mobileweb'];

export function isPhone() {
  const platform = getPlatforms();
  if (phone.indexOf(platform[0]) === -1) return false;
  else return true;
}

export default function isMobile() {
  const flag = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
  );
  return flag;
}
