<template>
  <!-- 操作的按钮 -->
  <div class="btns">
    <ion-button v-vibration="5">
      {{ num }}
    </ion-button>

    <!-- 添加/导入/导出按钮 -->
    <ion-button id="menuModal" :disabled="loading.update" v-vibration="5">
      <ion-icon :icon="personAddOutline"></ion-icon>
    </ion-button>

    <!-- 更新全部 -->
    <ion-button
      id="updateAll"
      @click="updateAll"
      :disabled="loading.update || loading.input || loading.add"
      v-vibration="5"
    >
      <ion-icon :icon="refresh" v-if="!loading.update"></ion-icon>
      <div v-else style="display: flex; align-items: center">
        <ion-spinner name="bubbles"></ion-spinner>
        {{ updateMsg }}
      </div>
    </ion-button>

    <!-- 整理顺序 -->
    <ion-button
      :disabled="loading.update || loading.input || loading.add"
      @click="sortList"
      v-vibration="5"
    >
      <ion-icon :icon="swapVerticalOutline"></ion-icon>
    </ion-button>

    <!-- 直播间列表返回顶部 -->
    <ion-button @click="$emit('goTop')" v-vibration="5">
      <ion-icon :icon="arrowUpOutline"></ion-icon>
    </ion-button>
  </div>

  <!-- 添加直播间 / 导入 / 导出 的模态框 -->
  <ion-modal ref="menuModalRef" trigger="menuModal">
    <ion-header>
      <ion-toolbar>
        <ion-title class="modal-title">添加直播间</ion-title>
        <ion-buttons slot="end" class="modal-close">
          <ion-button @click="close" v-vibration="5"> 关闭 </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="padding">
        <ion-item>
          <ion-label position="stacked">房间 ID</ion-label>
          <ion-input
            ref="input"
            label=""
            type="text"
            v-model:modelValue="data.roomId"
            :clear-input="true"
            placeholder="请输入直播间的 ID"
          ></ion-input>
        </ion-item>
        <ion-radio-group v-model:modelValue="data.type">
          <ion-item>
            <ion-radio value="bili">B站</ion-radio>
          </ion-item>
          <ion-item>
            <ion-radio value="douyu">斗鱼</ion-radio>
          </ion-item>
        </ion-radio-group>
        <ion-button
          style="margin-top: 20px; width: 100%"
          :disabled="loading.input || loading.add"
          @click="add()"
          v-vibration="5"
        >
          <ion-spinner v-if="loading.add" name="bubbles"></ion-spinner>
          添加
        </ion-button>
      </div>

      <div class="padding">
        <ion-item>
          <ion-label position="stacked">JSON</ion-label>
          <ion-input
            ref="input"
            label=""
            type="text"
            v-model:modelValue="jsonData"
            :clear-input="true"
            placeholder="输入JSON代码"
            :disabled="loading.input"
          ></ion-input>
        </ion-item>
        <ion-button
          style="margin-top: 10px; width: 100%"
          @click="inputData"
          :disabled="loading.input || loading.add"
          v-vibration="5"
        >
          <span v-if="!loading.input">导入</span>
          <div v-else style="display: flex; align-items: center">
            <ion-spinner name="bubbles"></ion-spinner>
            {{ inputMsg }}
          </div>
        </ion-button>

        <ion-button
          style="margin-top: 10px; width: 100%"
          @click="inputDefData"
          v-vibration="5"
          :disabled="loading.input || loading.add"
          >导入默认数据</ion-button
        >

        <ion-button
          style="margin-top: 10px; width: 100%"
          @click="exportJson"
          v-vibration="5"
          :disabled="loading.input"
          >导出</ion-button
        >
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonButtons,
  IonButton,
  IonModal,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonContent,
  IonTitle,
  IonInput,
  IonItem,
  IonIcon,
  IonSpinner,
  IonRadio,
  IonRadioGroup,
} from '@ionic/vue';
import {
  personAddOutline,
  swapVerticalOutline,
  arrowUpOutline,
  refresh,
} from 'ionicons/icons';
import '@/theme/hideScrollbar.css';
import { sortList } from '@/hooks/useMenu';
import { computed, reactive, ref } from 'vue';
import { vibrate } from '@/utils/impact';
import { Platform } from '@/types/player';
import { usePlayerStore } from '@/stores/playerStore';
import defRoomList from '@/config/roomList';
import { Clipboard } from '@capacitor/clipboard';
import { message } from '@/utils/message';
import useRoomList from '@/hooks/useRoomList';

defineOptions({ name: 'MenuBtns' });

defineEmits<{
  (e: 'goTop'): void;
}>();
const playerStore = usePlayerStore();
const menuModalRef = ref<InstanceType<typeof IonModal>>();
const data = reactive<{
  roomId: number | undefined;
  type: Platform;
}>({
  roomId: undefined,
  type: Platform.Bili,
});
const loading = reactive({
  update: false,
  add: false,
  input: false,
});
const jsonData = ref(''),
  inputMsg = ref(''),
  updateMsg = ref('');
const num = computed(() => playerStore.roomList.length);

const roomList = useRoomList();

function close() {
  if (menuModalRef.value) menuModalRef.value.$el.dismiss(null, 'cancel');
}

// 添加数据
async function add() {
  vibrate(5);
  loading.add = true;
  try {
    if (data.roomId === undefined) throw new Error('roomId为空');
    const type = data.type;
    const roomId = data.roomId;

    await roomList.add(roomId, type);
    sortList();
  } catch (error) {
    console.log(error);
    await message('更新失败!');
  }
  loading.add = false;
}

// 更新全部
async function updateAll() {
  loading.update = true;
  const count = playerStore.roomList.length;
  let now = 0;
  updateMsg.value = `${now} / ${count}`;
  for (let index = 0; index < count; index++) {
    try {
      await roomList.update(
        playerStore.roomList[index].roomId,
        playerStore.roomList[index].platform,
        false,
      );
      now++;
    } catch (error) {
      now++;
    }
    updateMsg.value = `${now} / ${count}`;
  }
  await message('更新完成!');
  sortList();
  loading.update = false;
}

// 导入数据
async function inputData() {
  loading.input = true;
  try {
    if (jsonData.value.length === 0) {
      throw new Error('json数据为空');
    }
    const list: {
      [Platform.Bili]: number[];
      [Platform.Douyu]: number[];
    } = JSON.parse(jsonData.value);
    const count = list[Platform.Bili].length + list[Platform.Douyu].length;
    let now = 0;
    inputMsg.value = `0 / ${count}`;
    for (const roomId of list[Platform.Bili]) {
      await roomList.add(roomId, Platform.Bili, false);
      inputMsg.value = `${now++} / ${count}`;
    }

    for (const roomId of list[Platform.Douyu]) {
      await roomList.add(roomId, Platform.Douyu, false);
      inputMsg.value = `${now++} / ${count}`;
    }

    await message('更新成功!');
  } catch (error) {
    await message('更新失败!');
    // console.log(error);
  }
  inputMsg.value = '';
  loading.input = false;
}

// 导出数据
async function exportJson() {
  const biliList = playerStore.roomList.filter(
    (item) => item.platform === Platform.Bili,
  );
  const douyuList = playerStore.roomList.filter(
    (item) => item.platform === Platform.Douyu,
  );
  const list = {
    [Platform.Bili]: biliList.map((item) => item.roomId),
    [Platform.Douyu]: douyuList.map((item) => item.roomId),
  };
  await Clipboard.write({
    string: JSON.stringify(list),
  });
  await message('复制成功!');
}

// 导入默认数据
async function inputDefData() {
  jsonData.value = defRoomList;
  await inputData();
  sortList();
}

defineExpose({
  ignore: [menuModalRef],
  loading,
});
</script>

<style scoped>
.btns {
  height: 60px;
  display: flex;
  padding-top: 6px;
  box-sizing: border-box;
  justify-content: left;
  align-items: top;
}

.padding {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.room-name {
  font-size: 16px;
  font-weight: 600;
}
.tips-item {
  opacity: 0.8;
}
</style>