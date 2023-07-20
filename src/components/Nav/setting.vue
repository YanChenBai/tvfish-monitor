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
      <ion-list>
        <ion-item>
          <ion-label>
            黑暗增强
            <div>{{ nightOverlayOpacity }}</div>
          </ion-label>
          <ion-range
            :min="40"
            @ionChange="onIonChange"
            :value="nightOverlayOpacity"
          ></ion-range>
        </ion-item>
        <ion-item>
          <ion-toggle v-model:modelValue="config.backgroundMode"
            >后台模式{{ config.backgroundMode }}</ion-toggle
          >
        </ion-item>
        <ion-item>
          <ion-toggle v-model:modelValue="config.leaveWinCloseNav"
            >窗口失去焦点关闭导航</ion-toggle
          >
        </ion-item>
        <ion-item>
          <ion-toggle v-model:modelValue="config.autoCloseNav"
            >自动关闭导航</ion-toggle
          >
        </ion-item>
      </ion-list>
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
  IonItem,
  IonList,
  IonToggle,
  IonLabel,
} from '@ionic/vue';
import { storeToRefs } from 'pinia';

defineOptions({ name: 'NavSetting' });
const { nightOverlayOpacity, config } = storeToRefs(usePlayerStore());
const settingModal = ref();
function cancel() {
  settingModal.value.$el.dismiss(null, 'cancel');
}

function onIonChange({ detail }: CustomEvent) {
  nightOverlayOpacity.value = detail.value;
}
</script>

<style scoped></style>
