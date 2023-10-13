import { MaybeElementRef } from '@vueuse/core';
import { Ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { isPhone } from '@/utils/isMobile';
import { useBackButton } from '@ionic/vue';
import { useConfigStore } from '@/stores/config';

// 菜单逻辑
export function useMenu(el: MaybeElementRef, ignore: Ref<any>[]) {
  const playerStore = useConfigStore();
  // 关闭Menu
  onClickOutside(el, () => (playerStore.menuState = false), {
    ignore,
  });

  if (isPhone()) {
    // 监听系统返回
    useBackButton(10, () => {
      playerStore.menuState = false;
    });
  }
}
