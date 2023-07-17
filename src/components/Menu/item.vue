<template>
  <div class="item-wrap" :class="{ ['is-top']: isTop }">
    <div
      class="item-box"
      :style="{ opacity: info.status === RoomStatus.LIVE ? '1' : '0.3' }"
    >
      <div class="face" @click="update">
        <img draggable="false" :src="info.face" />
      </div>
      <div class="info">
        <div class="name">
          <n-ellipsis class="ellipsis-width">
            {{ info.name }}
            <template #tooltip>
              <div class="ellipsis-width">{{ info.name }}</div>
            </template>
          </n-ellipsis>
        </div>
        <div class="title">
          <n-ellipsis class="ellipsis-width">
            {{ info.title }}
            <template #tooltip>
              <div class="ellipsis-width">{{ info.title }}</div>
            </template>
          </n-ellipsis>
        </div>
        <div class="news">
          <n-ellipsis class="ellipsis-width">
            公告：{{ info.news }}
            <template #tooltip>
              <div class="ellipsis-width">{{ info.news }}</div>
            </template>
          </n-ellipsis>
        </div>
      </div>
      <div class="drag" :ref="drag">
        <ion-icon :icon="moveOutline"></ion-icon>
      </div>
      <div class="keyframe">
        <div
          class="platform"
          :style="{
            background: info.platform === 'bili' ? '#fb7299' : '#ff5d23',
          }"
        >
          {{ info.platform === 'bili' ? 'b站' : '斗鱼' }}
        </div>
        <div class="status" :class="{ [roomStatusClass[info.status]]: true }">
          <span v-if="info.status === RoomStatus.LIVE">上班</span>
          <span v-else-if="info.status === RoomStatus.CLOSE">下班</span>
          <span v-else-if="info.status === RoomStatus.REC">录像</span>
        </div>

        <div
          class="setting"
          @click.prevent="() => (disabled ? '' : setting())"
          :style="{ filter: disabled ? 'brightness(0.8)' : 'brightness(1)' }"
          v-vibration="5"
        >
          <ion-icon :icon="settingsOutline"></ion-icon>
        </div>

        <img
          v-if="keyframeState"
          draggable="false"
          :src="info.keyframe"
          @error="() => (keyframeState = false)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { moveOutline, settingsOutline } from 'ionicons/icons';
import { NEllipsis } from 'naive-ui';
import { usePlayerStore } from '@/stores/playerStore';
import { DropType } from '@/types/drop';
import { useDrag } from 'vue3-dnd';
import { computed, ref } from 'vue';
import { RoomListItem, RoomStatus } from '@/types/player';
import { impactHeavy, vibrate } from '@/utils/impact';

defineOptions({ name: 'MenuItem' });

const playerStore = usePlayerStore();
const emit = defineEmits(['drag', 'setting']);
const roomStatusClass = ['close', 'live', 'rec'];

const props = defineProps<{
  info: RoomListItem;
  disabled: boolean;
}>();
const keyframeState = ref(true);
function update() {
  vibrate(15);
  playerStore.updateRoomInfo(props.info.roomId, props.info.platform);
}

const isTop = computed(() => {
  return playerStore.queryTop(props.info.roomId, props.info.platform) === -1
    ? false
    : true;
});
const setting = () => emit('setting');
let dragLock = true;

// 创建拖拽
const [, drag] = useDrag({
  type: DropType.MenuItem,
  item: {
    type: DropType.MenuItem,
    info: props.info,
  },
  collect: (monitor) => {
    playerStore.menuItemIsDragging = monitor.isDragging();
    if (monitor.isDragging()) {
      emit('drag', props.info);
      if (dragLock) {
        dragLock = false;
        impactHeavy();
      }
    }
    return {
      isDragging: monitor.isDragging(),
    };
  },
  end: () => {
    dragLock = true;
  },
});
</script>

<style scoped>
.item-wrap {
  width: 280px;
  background: rgb(56, 56, 56);
  border-radius: 5px;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.089);
  box-sizing: border-box;
}
.item-box {
  display: flex;
  flex-wrap: wrap;
  /* height: 64px; */
}
.is-top {
  border: 2px solid #cf1e36b7;
}
.face {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  position: relative;
  padding: 2px 0 0 2px;
  box-sizing: border-box;
}
.tag {
  position: absolute;
  background-color: #2080f0;
  opacity: 0.5;
  padding: 0px 8px;
  border-radius: 4px;
  left: 2px;
  top: 2px;
}
.face img {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  user-select: none;
  width: 100%;
}

.info {
  width: 156px;
  padding: 0px 10px;
}
.ellipsis-width {
  max-width: 156px;
}
.title,
.news {
  color: #bbb9b9;
  font-size: 12px;
}
.name {
  width: calc(100%);
}
.drag {
  width: 58px;
  height: 58px;
  margin: 2px 2px 0 0;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.089);
  font-size: 20px;
  color: #b8b7b7;
  display: flex;
  align-items: center;
  justify-content: center;
}
.live {
  background-color: #ee3a3a;
}
.unlive {
  background-color: #b8b7b7;
}
.keyframe {
  width: 100%;
  height: 155px;
  display: flex;
  padding-top: 2px;
  position: relative;
}
.keyframe img {
  width: 100%;

  border-radius: 4px;
  user-select: none;
}
.platform {
  width: 50px;
  height: 23px;
  position: absolute;
  left: 4px;
  top: 6px;
  text-align: center;
  background: #2080f0;
  border-radius: 4px;
}
.setting {
  width: 30px;
  height: 23px;
  position: absolute;
  font-size: 16px;
  right: 4px;
  top: 6px;
  text-align: center;
  background: #2080f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status {
  position: absolute;
  padding: 0 4px;
  border-radius: 4px;
  height: 23px;
  left: 58px;
  top: 6px;
}
.status.close {
  background-color: #f4f5f8;
  color: #6d6c6c;
}
.status.live {
  background-color: #ff4961;
}
.status.rec {
  background-color: #428cff;
}
</style>
