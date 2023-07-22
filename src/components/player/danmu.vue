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
      useSlot
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
        <div v-else-if="danmu.type === DnamuType.DEF" class="dnamu-def">
          {{ danmu.content }}
        </div>
        <div v-else-if="danmu.type === DnamuType.EMO" class="dnamu-def">
          <img
            :src="IMAGE_PROXY + danmu.content.emoticon.url"
            style="max-height: 40px"
            :style="{
              height: `${danmu.content.emoticon?.height}px`,
            }"
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
import DouyuDanmu from '@/utils/douyuDanmu/douyu';
import { startListen } from 'blive-message-listener/browser';
import VueDanmuKu from 'vue3-danmaku';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { DanmuMsg, Message, SuperChatMsg } from 'blive-message-listener';
import { IMAGE_PROXY } from '@/config/proxy';

defineOptions({ name: 'PlayerDanmu' });

enum DnamuType {
  DEF = 0,
  SC = 1,
  EMO = 2,
  EMO_IN_MSG = 3,
}

const { playerList, playerListConfig, layoutIndex } = storeToRefs(
  usePlayerStore(),
);
const emit = defineEmits(['liveStart', 'liveEnd', 'titleChange']);
const props = defineProps<{
  playerName: string;
}>();
const player = computed(() => playerList.value[props.playerName]);

const playerConfig = computed(() => playerListConfig.value[props.playerName]);
const danmus: any = [],
  danmakuRef = ref<InstanceType<typeof VueDanmuKu>>();

// 关闭弹幕
let connectClose = (): any => ({});

function addDnamu(msg: {
  content: string | SuperChatMsg | any;
  type: DnamuType;
}) {
  if (danmakuRef.value === undefined) return;
  danmakuRef.value.insert(msg);
}

// 启动b站弹幕
function biliDanmu(id: number) {
  const { close } = startListen(id, {
    onIncomeDanmu: (msg: Message<DanmuMsg>) => {
      if (msg.body.emoticon !== undefined) {
        addDnamu({
          content: msg.body,
          type: DnamuType.EMO,
        });
      } else if (msg.body.in_message_emoticon !== undefined) {
        for (const key in msg.body.in_message_emoticon) {
          const item = msg.body.in_message_emoticon[key];
          msg.body.content = msg.body.content.replaceAll(
            key,
            `<img src='${
              IMAGE_PROXY + item.url
            }' style='max-height: 40px;height: ${item.height}px' />`,
          );
        }

        addDnamu({
          content: msg.body.content,
          type: DnamuType.EMO_IN_MSG,
        });
      } else {
        addDnamu({
          content: msg.body.content,
          type: DnamuType.DEF,
        });
      }
    },
    onLiveStart: () => {
      emit('liveStart');
    },
    onLiveEnd: () => emit('liveEnd'),
    onIncomeSuperChat: (msg: Message<SuperChatMsg>) =>
      addDnamu({
        content: msg.body,
        type: DnamuType.SC,
      }),
    onRoomInfoChange: (msg) => emit('titleChange', msg.body.title),
  });
  connectClose = close;
}

// 启动斗鱼弹幕
function douyuDanmu(id: number) {
  const danmu = new DouyuDanmu(id, (msg: string) =>
    addDnamu({
      content: msg,
      type: DnamuType.DEF,
    }),
  );
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
  danmakuRef.value.resize();
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
  if (danmakuRef.value === undefined) return;
  danmakuRef.value.resize();
});

// 2. 窗口大小切换
const debouncedFn = useDebounceFn(() => {
  if (danmakuRef.value === undefined) return;
  danmakuRef.value.resize();
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

<style scoped>
.sc {
  display: flex;
  padding: 4px;
  border-radius: 4px;
}
.price {
  background: rgba(255, 255, 255, 0.2);
  padding: 0 4px;
  border-radius: 4px;
}
.content {
  color: #f5f5f5;
}
.dnamu-def {
  color: rgb(63, 149, 224);
  text-shadow: 1px 1px 1px #000;
  font-size: 20px;
}
</style>
