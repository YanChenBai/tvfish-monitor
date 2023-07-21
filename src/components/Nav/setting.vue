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
            v-vibration="5"
          ></ion-range>
        </ion-item>
        <!-- <ion-item>
          <ion-toggle v-model:modelValue="config.backgroundMode"
            >后台模式</ion-toggle
          >
        </ion-item> -->
        <ion-item>
          <ion-toggle
            v-model:modelValue="config.leaveWinCloseNav"
            v-vibration="5"
            >窗口失去焦点关闭导航</ion-toggle
          >
        </ion-item>
        <ion-item>
          <ion-toggle v-model:modelValue="config.autoCloseNav" v-vibration="5"
            >自动关闭导航</ion-toggle
          >
        </ion-item>

        <ion-item>
          <ion-label>检查通知权限</ion-label>
          <ion-button @click="requestPermissions" v-vibration="5"
            >检查</ion-button
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
import { LocalNotifications } from '@capacitor/local-notifications';
import { PermissionState } from '@capacitor/core';
import { message } from '@/utils/message';

defineOptions({ name: 'NavSetting' });
const { nightOverlayOpacity, config } = storeToRefs(usePlayerStore());
const settingModal = ref();

function cancel() {
  settingModal.value.$el.dismiss(null, 'cancel');
}

function onIonChange({ detail }: CustomEvent) {
  nightOverlayOpacity.value = detail.value;
}

function getTips(status: PermissionState | null) {
  switch (status) {
    case 'prompt':
      return '获取授权';
    case 'prompt-with-rationale':
      return '再次申请';
    case 'granted':
      return '已授权';
    case 'denied':
      return '已拒绝';
    default:
      return '';
  }
}

async function requestPermissions() {
  const res = await LocalNotifications.checkPermissions();
  if (res.display === 'prompt' || res.display === 'prompt-with-rationale') {
    const res = await LocalNotifications.requestPermissions();
    await message(getTips(res.display));
    return;
  }
  await message(getTips(res.display));
}
</script>

<style scoped></style>
