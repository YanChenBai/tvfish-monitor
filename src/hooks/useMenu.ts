import { MaybeElementRef } from '@vueuse/core';
import { Ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { isPhone } from '@/utils/isMobile';
import { useBackButton } from '@ionic/vue';
import { usePlayerStore } from '@/stores/playerStore';

// 菜单逻辑
export function useMenu(el: MaybeElementRef, ignore: Ref<any>[]) {
  const playerStore = usePlayerStore();
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
