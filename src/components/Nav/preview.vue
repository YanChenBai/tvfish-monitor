<template>
  <ion-modal ref="layoutModal" trigger="layoutModal">
    <ion-header>
      <ion-toolbar>
        <ion-title class="modal-title"> 布局 </ion-title>
        <ion-buttons slot="end" class="modal-close">
          <ion-button @click="cancel()" v-vibration="5">关闭</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="content hide-scrollbar">
        <div style="text-align: center; font-size: 20px; padding: 10px 0">
          当前布局: {{ layoutIndex + 1 }}
        </div>
        <ion-grid>
          <ion-row>
            <template
              v-for="(layout, index) in layouts"
              :key="`layoutIndex_item_${index}`"
            >
              <ion-col size="4" size-sm="3">
                <div
                  class="preview-item-wrap"
                  :class="{ current: layoutIndex === index }"
                >
                  <div
                    class="preview-item"
                    @click="updateLayout(index)"
                    v-vibration="5"
                  >
                    <div
                      v-for="(item, key) in layout"
                      :key="`layoutIndex_item_block_${index}_${key}`"
                      class="preview-win"
                      :style="{
                        left: `${size * item.x}%`,
                        top: `${size * item.y}%`,
                        width: `calc(${size * item.w}% - 4px)`,
                        height: `calc(${size * item.h}% - 4px)`,
                      }"
                    ></div>
                  </div>
                  <div class="item-num">
                    <div class="num">{{ index + 1 }}</div>
                    <div class="win-num">{{ layout.length }}win</div>
                  </div>
                </div>
              </ion-col>
            </template>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonButtons,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonContent,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/playerStore';
import { ref } from 'vue';
import '@/theme/hideScrollbar.css';
defineOptions({ name: 'layoutPreview' });
import layouts from '@/config/lauouts';

const size = 100 / 12;
const layoutModal = ref();
const { layoutIndex } = storeToRefs(usePlayerStore());

function cancel() {
  layoutModal.value.$el.dismiss(null, 'cancel');
}

function updateLayout(index: number) {
  layoutIndex.value = index;
  cancel();
}
</script>

<style scoped>
.title {
  width: 100%;
  text-align: center;
}
.content {
  height: 100%;
  overflow-y: scroll;
  padding-bottom: 20px;
  box-sizing: border-box;
}
.preview-item-wrap {
  width: 100%;
  height: 132px;
  background: #4b4b4b;
  border-radius: 4px;
  padding: 4px 0 0 4px;
  box-sizing: border-box;
  overflow: hidden;
}
.preview-item {
  width: 100%;
  height: 100px;
  position: relative;
}

.preview-item-wrap:hover .preview-win,
.preview-item-wrap:hover .num {
  background: #252525;
}
.preview-item-wrap:hover .item-num {
  color: #252525;
}

.preview-win {
  transition: all 0.3s;
  border-radius: 2px;
  background: #121212;
  position: absolute;
}

.item-num {
  width: 100%;
  color: #121212;
  text-align: center;
  height: 28px;
  line-height: 20px;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  transition: all 0.3s;
}

.num {
  width: 20px;
  height: 20px;
  background: #292929;
  border-radius: 10px;
  color: #575757;
  transition: all 0.3s;
}

.current {
  filter: brightness(1.7);
}
</style>
