import { BackgroundMode } from '@anuradev/capacitor-background-mode';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vibrate from './utils/vibrationDirective';
import { IonicVue } from '@ionic/vue';
import { LocalNotifications } from '@capacitor/local-notifications';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
/* Theme variables */
import './theme/variables.css';
import '@/theme/title.center.css';
import pinia from '@/stores';
import { isPhone } from './utils/isMobile';

const app = createApp(App).use(IonicVue).use(pinia).use(router).use(vibrate);

console.warn = () => ({});
router.isReady().then(() => {
  app.mount('#app');
});

if (isPhone()) {
  BackgroundMode.enable();
  BackgroundMode.disableWebViewOptimizations();
}
