export enum ConfigType {
  Flv = 'flv',
  Hls = 'hls',
}
export interface Config {
  url: string;
  type: ConfigType;
}
