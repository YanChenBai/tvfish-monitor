let IMAGE_PROXY = '';
switch (import.meta.env.VITE_MODE) {
  case 'ELECTRON_DEV':
  case 'ELECTRON_PRO':
    IMAGE_PROXY = import.meta.env.VITE_ELECTRON_SERVER + '/img';
    break;
  case 'IONIC_DEV':
  case 'IONIC_PRO':
  default:
    IMAGE_PROXY = import.meta.env.VITE_IONIC_SERVER + '/img';
}
export { IMAGE_PROXY };
