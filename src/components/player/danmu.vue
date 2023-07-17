<template>
  <div class="danmu-wrap">
    <VueDanmuKu
      style="width: 100%; height: 100%"
      autoplay
      ref="danmakuRef"
      :danmus="danmus"
      :channels="3"
      :speeds="60"
      :fontSize="22"
      :debounce="200"
      :isSuspend="true"
      extraStyle="color: rgb(63, 149, 224);text-shadow: 1px 1px 1px #000;"
    ></VueDanmuKu>
  </div>
</template>

<script setup lang="ts">
import { Platform } from '@/types/player';
import DouyuDanmu from '@/utils/douyuDanmu/douyu';
import { startListen } from 'blive-message-listener/browser';
import VueDanmuKu from 'vue3-danmaku';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';


defineOptions({ name: 'PlayerDanmu' });

const { playerList, playerListConfig, layoutIndex } = storeToRefs(
  usePlayerStore(),
);
const props = defineProps<{
  playerName: string;
}>();
const player = computed(() => playerList.value[props.playerName]);

const playerConfig = computed(() => playerListConfig.value[props.playerName]);
const danmus: any = [],
  danmakuRef = ref<InstanceType<typeof VueDanmuKu>>();

// 关闭弹幕
let connectClose = (): any => ({});

function addDnamu(msg: string) {
  if (danmakuRef.value === undefined) return;
  danmakuRef.value.insert(msg);
}

// 启动b站弹幕
function biliDanmu(id: number) {
  const { close } = startListen(id, {
    onIncomeDanmu: (msg: any) => addDnamu(msg.body.content),
  });
  connectClose = close;
}

// 启动斗鱼弹幕
function douyuDanmu(id: number) {
  const danmu = new DouyuDanmu(id, (msg: string) => addDnamu(msg));
  danmu.connect();
  connectClose = () => danmu.close();
}

// 启动弹幕
function danmuStart() {
  if (player.value === null) {
    return;
  } else {
    connectClose();
    switch (player.value.platform) {
      case Platform.Bili:
        biliDanmu(player.value.roomId);
        break;
      case Platform.Douyu:
        douyuDanmu(player.value.roomId);
        break;
    }
  }
}

function switchDanmu() {
  if (danmakuRef.value === undefined) return;
  if (playerConfig.value.danmu) {
    danmuStart();
    danmakuRef.value.play();
    danmakuRef.value.show();
  } else {
    connectClose();
    danmakuRef.value.stop();
    danmakuRef.value.hide();
  }
}

/** 弹幕容器宽度重新计算 */
// 1. 布局切换
watch(layoutIndex, () => {
  danmakuRef.value?.resize();
});

// 2. 窗口大小切换
const debouncedFn = useDebounceFn(() => {
  danmakuRef.value?.resize();
}, 1000);

window.addEventListener('resize', debouncedFn);

// 监听当前窗口的配置更新
watch(player, () => {
  if (player.value === null) {
    connectClose();
  } else {
    switchDanmu();
  }
});

// 监听弹幕状态开启或关闭
watch(
  () => playerConfig.value.danmu,
  () => switchDanmu(),
);

// 初始化
onMounted(() => {
  switchDanmu();
  setTimeout(() => danmakuRef.value?.resize(), 0);
});
</script>

<style scoped></style>
