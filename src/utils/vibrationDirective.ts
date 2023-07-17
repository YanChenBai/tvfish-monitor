import { App, Directive, DirectiveBinding, Plugin } from 'vue';
import { isPhone } from './isMobile';
import { vibrate } from './impact';
export const vibrationDirective: Directive = {
  mounted: (el: HTMLElement, binding: DirectiveBinding<number>) => {
    let vibrationTime = 50;
    if (binding.value !== undefined) vibrationTime = binding.value;
    if (isPhone()) {
      el.addEventListener('click', () => {
        vibrate(vibrationTime);
      });
    }
  },
};

export default <Plugin>{
  install: (app: App) => app.directive('vibration', vibrationDirective),
};
