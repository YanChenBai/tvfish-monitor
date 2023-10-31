import axios from 'axios';
import Joi from 'joi';
import { ResizeOptions } from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import md5 from 'js-md5';
import { ImageParams } from './type';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

const MODE = process.env.VITE_MODE;
const cachePath =
  MODE === 'ELECTRON_DEV'
    ? path.resolve(__dirname, './cache')
    : path.resolve((process as any).resourcesPath, './cache');
const autoClearPath = path.resolve(cachePath, './auto_clear');

const schemaImg = Joi.object<ImageParams>({
  url: Joi.string()
    .pattern(/^(https?:\/\/(?:[\w-]+\.)+[\w-]+)/i)
    .required(),
  fit: Joi.string()
    .valid('contain', 'cover', 'fill', 'inside', 'outside')
    .optional(),
  w: Joi.number().optional(),
  h: Joi.number().optional(),
  ac: Joi.boolean().default(false).optional(),
});

function creatResizeOption(params: ImageParams) {
  const option: ResizeOptions = {};
  if (params.fit) option.fit = params.fit;
  if (params.w) option.width = params.w;
  if (params.h) option.height = params.h;
  return option;
}

async function cacheImage(
  url: string,
  cacheFilePath: string,
  resize: ResizeOptions,
) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    const remoteImageBuffer = response.data;
    const newBuffer = await sharp(remoteImageBuffer)
      .resize(resize)
      .png()
      .toBuffer();

    // 将远程图片保存到本地缓存文件
    await fs.writeFile(cacheFilePath, newBuffer);

    return newBuffer;
  } catch (error) {
    console.log(error);
  }
}

export default async function getImage(params: ImageParams) {
  const { error, value } = schemaImg.validate(params);
  if (error !== undefined || value === undefined)
    throw new Error('Image params error');

  const query = value as ImageParams;
  const autoClear = query.ac;
  const findname = md5(query.url) + '.png';
  const cacheFilePath = path.resolve(
    autoClear ? autoClearPath : cachePath,
    findname,
  );

  try {
    return await fs.readFile(cacheFilePath);
  } catch (error) {
    const resize = creatResizeOption(query);
    const buffer = await cacheImage(query.url, cacheFilePath, resize);

    return buffer;
  }
}
