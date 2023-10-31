import Joi from 'joi';
import express from 'express';

import { getLiveInfo, getRoomInfo, getRoomInfoManyBili } from './src/service';
import { Platform, LiveInfoParams } from './src/type';

import { getResponseBody } from './src/utils';

import axios from 'axios';
import { ResizeOptions } from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import md5 from 'js-md5';
import { ImageParams } from './src/type';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

const MODE = process.env.VITE_MODE;
const isDev = MODE === 'ELECTRON_DEV';

const app = express();

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

const router = express.Router();

const liveSchema = {
  roomId: Joi.number().required(),
  type: Joi.string().allow(Platform.Bili, Platform.Douyu).required(),
};

const douyuLiveSchema = Joi.object({
  ...liveSchema,
  qn: Joi.number().optional().default(2),
  line: Joi.string().optional().default('ws-h5'),
});

const biliLiveSchema = Joi.object({
  ...liveSchema,
  qn: Joi.number().optional().default(null),
  line: Joi.number().optional().default(0),
});

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

router.get('/getLiveInfo', async (req, res) => {
  try {
    const type = (await liveSchema.type.validateAsync(
      req.query.type,
    )) as Platform;

    let params: LiveInfoParams;
    switch (type) {
      case Platform.Douyu:
        params = await douyuLiveSchema.validateAsync(req.query);
        break;
      case Platform.Bili:
        params = await biliLiveSchema.validateAsync(req.query);
        break;
    }
    res.json(await getLiveInfo(params));
  } catch (error) {
    res.json(getResponseBody(400, '请求错误！'));
  }
});

router.get('/getRoomInfo', async (req, res) => {
  try {
    const value = await Joi.object(liveSchema).validateAsync(req.query);
    return res.json(await getRoomInfo(value.type, value.roomId));
  } catch (error) {
    res.json(getResponseBody(400, '请求错误！'));
  }
});

const getManyRoomSchema = Joi.object({
  uids: Joi.array().items(Joi.number()).required(),
});

router.get('/getRoomInfoManyBili', async (req, res) => {
  try {
    const value = await getManyRoomSchema.validateAsync(req.query);
    res.json(await getRoomInfoManyBili(value.uids));
  } catch (error) {
    res.json(getResponseBody(400, '请求错误！'));
  }
});

router.get('/img', async function name(req, res) {
  try {
    const buffer = await getImage(req.query as any);
    res.setHeader('Content-Type', ' image/png');
    return res.end(buffer);
  } catch (error) {
    return res.status(400).send('Error!');
  }
});

export async function startServers(port: number) {
  app.use(router);
  // 启动服务器
  app.listen(port, () => {
    console.log('Server is running on port ' + port);
  });
}
// startServers(9000);
