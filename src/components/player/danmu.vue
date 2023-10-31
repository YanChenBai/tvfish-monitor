<template>
  <div class="danmu-wrap">
    <VueDanmuKu
      style="width: 100%; height: 100%"
      autoplay
      ref="danmakuRef"
      :danmus="danmus"
      :channels="3"
      :speeds="50"
      :fontSize="22"
      :debounce="200"
      :useSlot="true"
      :isSuspend="true"
    >
      <template v-slot:dm="{ danmu }">
        <div
          v-if="danmu.type === DnamuType.SC"
          class="sc"
          :style="{background:(danmu.content as SuperChatMsg).content_color}"
        >
          <div class="price">{{ (danmu.content as SuperChatMsg).price }}</div>
          <div class="content">
            {{ (danmu.content as SuperChatMsg).content }}
          </div>
        </div>
        <div
          v-else-if="danmu.type === DnamuType.DEF"
          class="dnamu-def"
          :style="{
            color: danmu.color,
          }"
        >
          {{ danmu.content }}
        </div>
        <div v-else-if="danmu.type === DnamuType.EMO" class="dnamu-def">
          <img
            :src="`${IMAGE_PROXY}?h=40&url=${danmu.content.emoticon.url}`"
            :style="
              getScaleSize(
                danmu.content.emoticon.height,
                danmu.content.emoticon.width,
              )
            "
          />
        </div>
        <div
          v-else-if="danmu.type === DnamuType.EMO_IN_MSG"
          class="dnamu-def"
          v-html="danmu.content"
        ></div>
        <div v-else class="dnamu-def">
          {{ danmu.content }}
        </div>
      </template>
    </VueDanmuKu>
  </div>
</template>

<script setup lang="ts">
import { Platform } from '@/types/player';
// import { startListen } from 'blive-message-listener/browser';
import { useDouyuDanmu } from '@/hooks/useDouyuDanmu';
import VueDanmuKu from 'vue3-danmaku';
import { useConfigStore } from '@/stores/config';
import { storeToRefs } from 'pinia';
import { onMounted, watch } from 'vue';
import { templateRef, useDebounceFn, promiseTimeout } from '@vueuse/core';
import { DanmuMsg, Message, SuperChatMsg } from 'blive-message-listener';
import { IMAGE_PROXY } from '@/config/proxy';
import injectStrict from '@/utils/injectStrict';
import { playerWrapProvides } from '@/utils/provides';
import { getDanmuColoe } from '@/utils/decodeDmV2';
import { startListen } from '@/utils/biliDanmuDecode';

defineOptions({ name: 'PlayerDanmu' });

enum DnamuType {
  DEF = 0,
  SC = 1,
  EMO = 2,
  EMO_IN_MSG = 3,
}

const { layoutIndex } = storeToRefs(useConfigStore());
const { playerConfig } = injectStrict(playerWrapProvides);
const emit = defineEmits(['liveStart', 'liveEnd', 'titleChange']);

const danmus: any = [],
  danmakuRef = templateRef<InstanceType<typeof VueDanmuKu>>('danmakuRef');

// 关闭弹幕
let connectClose = (): any => ({});

function addDnamu(msg: {
  content: string | SuperChatMsg | any;
  type: DnamuType;
  color: string;
}) {
  try {
    danmakuRef.value.insert(msg);
  } catch (error) {
    //
  }
}

// 启动b站弹幕
function biliDanmu(id: number) {
  const { close } = startListen(id, {
    onIncomeDanmu: (msg: DanmuMsg) => {
      if (msg.emoticon !== undefined) {
        addDnamu({
          content: msg,
          type: DnamuType.EMO,
          color: '',
        });
      } else if (msg.in_message_emoticon !== undefined) {
        for (const key in msg.in_message_emoticon) {
          const item = msg.in_message_emoticon[key];
          const scale = getScaleSize(item.height, item.width, 30);
          msg.content = msg.content.replaceAll(
            key,
            `<img src='${IMAGE_PROXY}?h=30&url=${item.url}' style='height:${scale.height};width:${scale.width};margin-left:4px' />`,
          );
        }
        addDnamu({
          content: msg.content,
          type: DnamuType.EMO_IN_MSG,
          color: '#fff',
        });
      } else {
        addDnamu({
          content: msg.content,
          type: DnamuType.DEF,
          color: '#fff',
        });
      }
    },
    onLiveStart: () => emit('liveStart'),
    onLiveEnd: () => emit('liveEnd'),
    onIncomeSuperChat: (msg: SuperChatMsg) =>
      addDnamu({
        content: msg,
        type: DnamuType.SC,
        color: '#fff',
      }),
    // onRoomInfoChange: (msg) => emit('titleChange', msg.body.title),
  });
  connectClose = close;
}

// 启动斗鱼弹幕
function douyuDanmu(id: number) {
  const { close } = useDouyuDanmu(id, {
    onIncomeDanmu: (msg) => {
      addDnamu({
        content: msg.txt,
        type: DnamuType.DEF,
        color: msg.color,
      });
    },
    onLiveStart: () => emit('liveStart'),
    onLiveEnd: () => emit('liveEnd'),
  });
  connectClose = () => close();
}

// 启动弹幕
function danmuStart() {
  connectClose();
  if (playerConfig.value.room === null) return;
  switch (playerConfig.value.room.platform) {
    case Platform.Bili:
      biliDanmu(playerConfig.value.room.roomId);
      break;
    case Platform.Douyu:
      douyuDanmu(playerConfig.value.room.roomId);
      break;
  }
}

// 弹幕开关
function switchDanmu() {
  if (playerConfig.value.danmu) {
    danmuStart();
    danmakuRef.value.play();
    danmakuRef.value.show();
  } else {
    connectClose();
    danmakuRef.value.stop();
    danmakuRef.value.hide();
  }
  setTimeout(() => danmakuRef.value?.resize(), 10);
}

function getScaleSize(h: number, w: number, def = 40) {
  const scale = def / h;
  return {
    height: `${h * scale}px`,
    width: `${w * scale}px`,
  };
}

/** 弹幕容器宽度重新计算 */

async function resize() {
  await promiseTimeout(100);
  try {
    danmakuRef.value.resize();
  } catch (err) {
    err;
  }
}

// 1. 布局切换
watch(layoutIndex, () => resize());

// 2. 窗口大小切换
const debouncedFn = useDebounceFn(() => resize(), 500);

window.addEventListener('resize', debouncedFn);

// 监听当前窗口的配置更新
watch(
  () => playerConfig.value.roomTypeId,
  () => switchDanmu(),
);

// 监听弹幕状态开启或关闭
watch(
  () => playerConfig.value.danmu,
  () => switchDanmu(),
);

// 初始化
onMounted(() => {
  switchDanmu();
});

defineExpose({
  connectClose,
});
</script>

<style scoped>
.danmu-wrap {
  width: 100%;
  height: 100%;
  z-index: 99;
  position: absolute;
}
.sc {
  display: flex;
  padding: 4px;
  border-radius: 4px;
  color: #fff;
}
.price {
  background: rgba(255, 255, 255, 0.2);
  padding: 0 4px;
  border-radius: 4px;
}
.content {
  color: #f5f5f5;
  padding: 0 6px;
}
.dnamu-def {
  color: #fff;
  font-weight: 600;
  text-shadow: 1px 0 1px #000000, 0 1px 1px #000000, 0 -1px 1px #000000,
    -1px 0 1px #000000;
  font-size: 26px;
  display: flex;
  align-items: center;
}
</style>
@/stores/config
