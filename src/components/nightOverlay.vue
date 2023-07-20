<template>
  <div
    class="night-overlay"
    ref="nightOverlayRef"
    @click="showTips()"
    :style="{ background: `rgba(0,0,0,${nightOverlayOpacity / 100})` }"
    v-if="showNightOverlay"
  >
    <Transition name="swiper">
      <div class="swiper-wrap" v-show="tipsState">
        <div class="text">滑动解锁</div>
        <div class="swiper-box">
          <swiper
            :short-swipes="false"
            :long-swipes="true"
            :long-swipes-ratio="0.8"
            :initial-slide="2"
            style="padding-right: 70px"
            @slideChange="changeDirection"
          >
            <swiper-slide>
              <div class="rail">
                <div class="rail-btn">
                  <ion-icon :icon="arrowForwardOutline" size="22"></ion-icon>
                </div>
              </div>
            </swiper-slide>
            <swiper-slide><div class="rail"></div></swiper-slide>
          </swiper>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import 'swiper/css';
import '@ionic/vue/css/ionic-swiper.css';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { arrowForwardOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/vue';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import { onLongPress } from '@vueuse/core';
import { ref, watch } from 'vue';
import { message } from '@/utils/message';
import { vibrate } from '@/utils/impact';

defineOptions({ name: 'nightOverlay' });

const { showNightOverlay, nightOverlayOpacity } = storeToRefs(usePlayerStore());
const nightOverlayRef = ref(),
  tipsState = ref(false);

onLongPress(nightOverlayRef, closeNightOverlay, {
  modifiers: { prevent: true },
  delay: 3000,
});

function closeNightOverlay() {
  showNightOverlay.value = false;
  vibrate(50);
  message('已关闭!');
}

let lock: number | null = null;
function showTips() {
  if (lock !== null) clearTimeout(lock);
  tipsState.value = true;
  lock = setTimeout(() => {
    tipsState.value = false;
  }, 5000);
}

function changeDirection(e: any) {
  if (e.activeIndex === 0) closeNightOverlay();
}

watch(showNightOverlay, (val) => {
  if (val) showTips();
});
</script>

<style scoped>
.night-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(156, 156, 156);
}
.swiper-wrap {
  padding: 0 20px;
  max-width: 400px;
  width: 100%;
  position: relative;
}
.swiper-box {
  border-radius: 4px;
  background-color: rgba(255, 254, 254, 0.192);
}
.rail {
  width: 100%;
  height: 70px;
  position: relative;
}
.rail-btn {
  height: 62px;
  width: 62px;
  margin: 4px;
  border-radius: 4px;
  background-color: rgb(15, 15, 15);
  position: absolute;
  right: -8px;
  transform: translateX(100%);
  color: rgba(255, 254, 254, 0.192);
  display: flex;
  align-items: center;
  justify-content: center;
}
.text {
  position: absolute;
  width: 100%;
  text-align: center;
  line-height: 70px;
  padding-right: 35px;
  color: rgba(230, 230, 230, 0.253);
}
.swiper-enter-active,
.swiper-leave-active {
  transition: opacity 0.2s ease;
}
.swiper-enter-from,
.swiper-leave-to {
  opacity: 0;
}
</style>
