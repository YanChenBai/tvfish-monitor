import { RoomStatus } from '@/types/player';
import { ComputedRef, Ref, ref } from 'vue';

export function useAutoUpdatePlayer(
  video: Ref<HTMLMediaElement | undefined>,
  status: Ref<RoomStatus> | ComputedRef<RoomStatus>,
  max = 10,
  cb: { (): void },
  isAutoClose = false,
) {
  const updateLastTime = ref(0);
  let updateTimer: number | null = null,
    autoUpdateCount = 0;

  function timeUpdateEvent(ev: Event) {
    if (status.value !== RoomStatus.LIVE) return;
    updateTimer ? clearInterval(updateTimer) : '';
    autoUpdateCount = 0;
    updateLastTime.value = ev.timeStamp;
    console.log(ev.timeStamp);

    if (video.value && isAutoClose)
      video.value.removeEventListener('timeupdate', timeUpdateEvent, false);

    // 自动刷新，如果超过两秒没有上报time的话就开始自动循环10次刷新如果有重新上报那就中断
    updateTimer = setInterval(() => {
      autoUpdateCount++;
      cb();
      console.log('刷新' + autoUpdateCount);

      if (autoUpdateCount >= max) updateTimer ? clearInterval(updateTimer) : '';
    }, 4000);
  }

  if (video.value) {
    // 监听video上报最新的时间
    video.value.addEventListener('timeupdate', timeUpdateEvent, false);
  }

  return {
    updateLastTime,
    updateTimer,
    autoUpdateCount,
  };
}
