import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isPhone } from './isMobile';


export async function impactHeavy() {
  if (isPhone()) await Haptics.impact({ style: ImpactStyle.Heavy });
}

export async function impactLight() {
  if (isPhone()) await Haptics.impact({ style: ImpactStyle.Light });
}

export async function impactMedium() {
  if (isPhone()) await Haptics.impact({ style: ImpactStyle.Medium });
}

export async function vibrate(duration: number) {
  if (isPhone()) {
    await Haptics.vibrate({
      duration,
    });
  }
}
