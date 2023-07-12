<template>
  <Transition name="control">
    <div v-show="show" class="control-wrap" @mouseleave="closeControl()">
      <div class="control-wrap-top" ref="topRef">
        <div class="title">
          <div class="name">{{ name }}</div>
          <n-ellipsis style="max-width: 200px">
            {{ title }}
          </n-ellipsis>
        </div>
        <ion-button color="danger" fill="clear" size="small" @click="destroy()">
          <ion-icon :icon="close"></ion-icon>
        </ion-button>
      </div>

      <div class="control-wrap-bottom" ref="bottomRef">
        <div class="left">
          <ion-button
            color="light"
            fill="clear"
            size="small"
            @click="refresh()"
          >
            <ion-icon :icon="refreshIcon"></ion-icon>
          </ion-button>

          <PlayerSlider v-model:volume="volume" @change="volumeChange">
            <template #target>
              <ion-button color="light" fill="clear" size="small">
                <ion-icon :icon="volumeHigh"></ion-icon>
                <div class="volume">{{ volume }}</div>
              </ion-button>
            </template>
          </PlayerSlider>
        </div>
        <div class="right">
          <ion-button
            color="light"
            fill="clear"
            size="small"
            @click="danmuSwitch()"
            >弹幕 {{ danmu ? '关' : '开' }}</ion-button
          >
          <PopoverSelect :list="qualitys" @change="qualityChange">
            <template #target>
              <ion-button color="light" fill="clear" size="small">
                清晰度
              </ion-button>
            </template>
            清晰度
          </PopoverSelect>
          <PopoverSelect :list="lines" @change="lineChange">
            <template #target>
              <ion-button color="light" fill="clear" size="small">
                线路
              </ion-button>
            </template>
            线路
          </PopoverSelect>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { RoomListItem, usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import { NEllipsis } from 'naive-ui';
import { IonButton, IonIcon } from '@ionic/vue';
import PopoverSelect from './select.vue';
import PlayerSlider from './slider.vue';
import {
  pause,
  play,
  refresh as refreshIcon,
  volumeHigh,
  close,
} from 'ionicons/icons';
import { useVModel, watchOnce } from '@vueuse/core';
import { Ref, computed, onMounted, ref, watch } from 'vue';
import VueDanmuKu from 'vue3-danmaku';
import { QualityType, LineType } from '@/types/player';

defineOptions({ name: 'PlayerControl' });

const { playerListConfig, navState, playerList } = storeToRefs(
  usePlayerStore(),
);
const props = defineProps<{
  show: boolean; // 控制栏显示状态
  name: string;
  danmakuRef: InstanceType<typeof VueDanmuKu> | undefined;
  lines: LineType[];
  qualitys: QualityType[];
}>();
const emit = defineEmits([
  'update:show',
  'destroy', // 销毁
  'refresh', // 刷新
  'danmuSwitch', // 弹幕开关
  'qualityChange', // 清晰切换
  'lineChange', // 线路切换
  'open', // 打开控制栏
  'close', // 关闭控制栏
  'volumeChange',
]);
const show = useVModel(props, 'show', emit);
const topRef = ref<HTMLElement>(),
  bottomRef = ref<HTMLElement>(),
  volume = ref(playerListConfig.value[props.name].volume * 100);

const title = computed(() =>
  playerList.value[props.name] ? playerList.value[props.name]?.title : '',
);

const danmu = computed(() => playerListConfig.value[props.name].danmu);

function openControl() {
  show.value = true;
  navState.value = true;
  emit('open');
}

function closeControl() {
  show.value = false;
  emit('close');
}

const danmuSwitch = () => {
  let tmp = !playerListConfig.value[props.name].danmu;
  playerListConfig.value[props.name].danmu = tmp;
  // tmp ? props.danmakuRef?.show() : props.danmakuRef?.hide();
  tmp ? props.danmakuRef?.play() : props.danmakuRef?.stop();
  emit('danmuSwitch', tmp);
};

const destroy = () => {
  emit('destroy');
};
const refresh = () => emit('refresh');

// 监听声音变化
function volumeChange(val: number) {
  emit('volumeChange', val / 100);
}

// 获取关闭控制栏时点击需要排除的地方
function getIgnore(): Ref<HTMLElement | undefined>[] {
  return [topRef, bottomRef];
}

const qualityChange = (item: QualityType) => emit('qualityChange', item);
const lineChange = (item: LineType) => emit('lineChange', item);

watchOnce(
  () => props.danmakuRef,
  () => danmuSwitch(),
);

// 暴露函数
defineExpose({
  getIgnore,
  openControl,
  closeControl,
});
</script>

<style scoped>
.control-wrap {
  color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  padding: 0;
  box-sizing: border-box;
  opacity: 1;
  z-index: 999;
}

.control-wrap-top {
  position: absolute;
  top: 0;
  left: 0;
  color: #fff;
  width: 100%;
  padding: 4px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.7);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.control-wrap-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.volume {
  width: 24px;
}

.title {
  display: flex;
  align-items: center;
  line-height: 18px;
  padding-left: 6px;
}

.name {
  background-color: #333333;
  padding: 2px 10px;
  border-radius: 4px;
  margin-right: 4px;
  text-transform: uppercase;
}

.control-enter-active,
.control-leave-active {
  transition: opacity 0.3s ease;
}

.control-enter-from,
.control-leave-to {
  opacity: 0;
}
</style>
