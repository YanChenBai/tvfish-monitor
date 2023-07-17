<template>
  <ion-modal ref="settingModal" trigger="settingModal">
    <ion-header>
      <ion-toolbar>
        <ion-title class="modal-title"> 设置 </ion-title>
        <ion-buttons slot="end" class="modal-close">
          <ion-button @click="cancel()" v-vibration="5">关闭</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div style="padding: 20px 40px; box-sizing: border-box">
        <div style="width: 100%; box-sizing: border-box">
          <div style="display: flex; align-items: center">
            黑暗遮罩透明度 {{ nightOverlayOpacity }}
          </div>
          <div>
            <ion-range
              :min="40"
              @ionChange="onIonChange"
              :value="nightOverlayOpacity"
            ></ion-range>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import {
  IonButtons,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonContent,
  IonTitle,
  IonRange,
} from '@ionic/vue';
import { storeToRefs } from 'pinia';

defineOptions({ name: 'NavSetting' });
const { nightOverlayOpacity } = storeToRefs(usePlayerStore());
const settingModal = ref();
function cancel() {
  settingModal.value.$el.dismiss(null, 'cancel');
}

function onIonChange({ detail }: CustomEvent) {
  nightOverlayOpacity.value = detail.value;
}
</script>

<style scoped>
.wrap {
  padding: 40px;
  box-sizing: border-box;
}
</style>
