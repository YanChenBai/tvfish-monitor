import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createORM } from 'pinia-orm';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate).use(createORM());

export default pinia;
