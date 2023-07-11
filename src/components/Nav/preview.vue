<template>
  <ion-modal ref="layoutModal" trigger="layoutModal">
    <ion-header>
      <ion-toolbar>
        <ion-title> 布局 </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="cancel()">关闭</ion-button>
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
            <template v-for="(item, index) in layout">
              <ion-col size="3" size-sm="3">
                <div
                  class="preview-item"
                  :style="{ 'grid-template-areas': item.area }"
                  @click="updateLayout(index)"
                >
                  <div class="item-num">{{ index + 1 }}</div>
                  <div
                    v-for="key in item.num"
                    class="preview-win"
                    :style="{ 'grid-area': String.fromCharCode(97 + key - 1) }"
                  ></div>
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
import layout from '@/hooks/layout';
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/playerStore';
import { ref } from 'vue';
import '@/theme/hideScrollbar.css';
defineOptions({ name: 'layoutPreview' });

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
.preview-item {
  display: grid;
  width: 100%;
  height: 70px;
  border: 2px solid #e8e8e8;
  background: #e8e8e8;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
}

.preview-item:hover .preview-win {
  background: rgb(76, 129, 214);
}

.preview-win {
  transition: all 0.3s;
  border: 1px solid #fff;
  border-radius: 4px;
  background: #2e62b6;
}

.item-num {
  position: absolute;
  width: 30px;
  height: 30px;
  background: white;
  color: #3472d6;
  text-align: center;
  line-height: 30px;
  left: calc(50% - 15px);
  top: calc(50% - 15px);
  border-radius: 30px;
}

.tips {
  font-size: 12px;
}

.tips .underline {
  color: #18a058;
  text-decoration-line: underline;
}
</style>
