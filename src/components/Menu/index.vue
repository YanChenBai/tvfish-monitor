<template>
  <MenuWrap ref="menuWrapRef" :ignore="ignore">
    <MenuContent :disabled="false" @setting="setting"> </MenuContent>
  </MenuWrap>
  <Setting ref="settingRef" />
</template>

<script setup lang="ts">
import MenuWrap from './menu.vue';
import MenuContent from './content.vue';
import { RoomListItem } from '@/types/player';
import Setting from '@/components/Menu/setting.vue';
import { onMounted, ref } from 'vue';

defineOptions({ name: 'MenuIndex' });

const settingRef = ref<InstanceType<typeof Setting>>(),
  menuWrapRef = ref<InstanceType<typeof MenuWrap>>(),
  ignore = ref<any[]>([settingRef]);
function setting(room: RoomListItem) {
  if (settingRef.value) {
    settingRef.value.open();
    console.log(ignore.value);
  }
}

onMounted(() => {
  menuWrapRef.value?.addIgnore(ignore.value);
});
</script>

<style scoped></style>
