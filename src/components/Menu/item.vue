<template>
  <div class="item-wrap">
    <div class="face" @click="update">
      <div
        :class="{ [Number(info.status) === 1 ? 'live' : 'unlive']: true }"
      ></div>
      <img draggable="false" :src="info.face" />
    </div>
    <div class="info">
      <div class="name">
        <n-ellipsis class="ellipsis-width">{{ info.name }}</n-ellipsis>
      </div>
      <div class="title">
        <n-ellipsis class="ellipsis-width">{{ info.title }}</n-ellipsis>
      </div>
      <div class="news">
        <n-ellipsis class="ellipsis-width">公告：{{ info.news }}</n-ellipsis>
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
      <n-config-provider
        :theme="darkTheme"
        :theme-overrides="{
          common: {
            primaryColor: '#428cff',
            primaryColorHover: '#5598ff',
            primaryColorPressed: '#3a7be0',
            primaryColorSuppl: '#3a7be0',
          },
          Button: {
            textColorPrimary: '#fff',
            textColorHoverPrimary: '#fff',
            textColorFocusPrimary: '#fff',
            textColorDisabledPrimary: '#fff',
          },
        }"
      >
        <n-popconfirm @positive-click="remove">
          删除
          <template #trigger>
            <div class="remove" @click.prevent="() => {}">
              <ion-icon :icon="trashOutline"></ion-icon>
            </div>
          </template>
        </n-popconfirm>
      </n-config-provider>

      <img draggable="false" :src="info.keyframe" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { moveOutline, trashOutline } from 'ionicons/icons';
import { NEllipsis, NPopconfirm, NConfigProvider, darkTheme } from 'naive-ui';
import {
  usePlayerStore,
  Platform,
  type RoomListItem,
} from '@/stores/playerStore';
import { DropType } from '@/types/drop';
import { useDrag } from 'vue3-dnd';
import { watch } from 'vue';

defineOptions({ name: 'MenuItem' });

const playerStore = usePlayerStore();
const emit = defineEmits(['drag']);
const props = defineProps<{
  info: RoomListItem;
}>();

function update() {
  playerStore.updateRoomInfo(props.info.realId, props.info.platform);
}

function remove() {
  playerStore.removeRoom(props.info.realId, props.info.platform);
}

// 创建拖拽
const [collect, drag] = useDrag({
  type: DropType.MenuItem,
  item: {
    type: DropType.MenuItem,
    info: props.info,
  },
  collect: (monitor) => {
    if (monitor.isDragging()) {
      emit('drag', props.info);
    }
    return {
      isDragging: monitor.isDragging(),
    };
  },
});
watch(collect, (val) => {
  playerStore.menuItemIsDragging = val.isDragging;
  console.log(playerStore.menuItemIsDragging);
});
</script>

<style scoped>
.item-wrap {
  display: flex;
  /* height: 64px; */
  width: 280px;
  background: rgb(56, 56, 56);
  border-radius: 5px;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.089);
  box-sizing: border-box;
  flex-wrap: wrap;
}
.face {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  position: relative;
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
  width: 60px;
  height: 60px;
  border-radius: 4px;
  user-select: none;
  width: 100%;
}

.info {
  width: 156px;
  padding: 0px 10px;
}
.ellipsis-width {
  width: 156px;
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
.live,
.unlive {
  width: 14px;
  height: 14px;
  position: absolute;
  left: 2px;
  top: 2px;
  border-radius: 7px;
  border: 2px solid #e6e6e6;
}
.live {
  background-color: #ee3a3a;
}
.unlive {
  background-color: #b8b7b7;
}
.keyframe {
  width: 100%;
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
  position: absolute;
  left: 4px;
  top: 6px;
  text-align: center;
  background: #2080f0;
  border-radius: 4px;
  opacity: 0.8;
}
.remove {
  width: 30px;
  height: 30px;
  position: absolute;
  font-size: 16px;
  right: 4px;
  top: 6px;
  text-align: center;
  background: #ee3a3ada;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
