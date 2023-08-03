let IMAGE_PROXY = '';
switch (import.meta.env.VITE_MODE) {
  case 'ELECTRON_DEV':
  case 'ELECTRON_PRO':
    IMAGE_PROXY = import.meta.env.VITE_ELECTRON_SERVER + '/img?url=';
    break;
  case 'IONIC_DEV':
  case 'IONIC_PRO':
  default:
    IMAGE_PROXY = import.meta.env.VITE_IONIC_SERVER + '/img?url=';
}
console.log(IMAGE_PROXY);

export { IMAGE_PROXY };
