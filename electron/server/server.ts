import Joi from 'joi';
import express from 'express';
import { getLiveInfo } from './bili/live';
import { getUserInfo } from './bili/info';
import { getUserInfoDouyu } from './douyu/info';
import { getRealUrl } from './douyu/live';
import { getResponseBody } from './utils';
import md5 from 'js-md5';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import type { FitEnum, ResizeOptions } from 'sharp';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

const MODE = process.env.VITE_MODE;
const cachePath =
  MODE === 'ELECTRON_DEV'
    ? path.resolve(__dirname, './cache')
    : path.resolve((process as any).resourcesPath, './cache');

const app = express();
interface ImageParams {
  url: string;
  fit?: keyof FitEnum;
  w?: number;
  h?: number;
  cache: boolean;
}

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

const router = express.Router();

router.get('/getLiveInfo', async (req, res) => {
  try {
    const type = await Joi.string()
      .allow('bili', 'douyu')
      .required()
      .validateAsync(req.query.type);

    const joiParams = {
      roomId: Joi.number().required(),
      type: Joi.string().allow('bili', 'douyu'),
    };

    if (type === 'bili') {
      const schema = Joi.object({
        ...joiParams,
        qn: Joi.number().optional().default(null),
        line: Joi.number().optional().default(0),
      });
      const value = await schema.validateAsync(req.query);
      res.json(await getLiveInfo(value.roomId, value.qn, value.line));
    } else if (type === 'douyu') {
      const schema = Joi.object({
        ...joiParams,
        qn: Joi.number().optional().default(2),
        line: Joi.string().optional().default('ws-h5'),
      });
      const value = await schema.validateAsync(req.query);
      res.json(await getRealUrl(value.roomId, value.qn, value.line));
    }
  } catch (error) {
    res.json(getResponseBody(400, '请求错误！'));
  }
});

router.get('/getRoomInfo', async (req, res) => {
  const roomId = req.query.roomId as string;
  const type = req.query.type;
  if (type === 'bili') {
    res.json(await getUserInfo(roomId));
  } else if (type === 'douyu') {
    res.json(await getUserInfoDouyu(roomId));
  }
});

async function getImage(
  url: string,
  cacheFilePath: string,
  resize: ResizeOptions,
  cache = true,
) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });
  const remoteImageBuffer = response.data;
  const newBuffer = await sharp(remoteImageBuffer)
    .resize(resize)
    .png()
    .toBuffer();

  // 将远程图片保存到本地缓存文件
  if (cache) await fs.writeFileSync(cacheFilePath, newBuffer);

  return newBuffer;
}

router.get('/img', async function name(req, res) {
  const regxUrl = /^(https?:\/\/(?:[\w-]+\.)+[\w-]+)/i;
  const regxNum = /^\d+(\.\d+)?$/i;
  const schema = Joi.object({
    url: Joi.string().pattern(regxUrl).required(),
    fit: Joi.string()
      .valid('contain', 'cover', 'fill', 'inside', 'outside')
      .optional(),
    w: Joi.string().pattern(regxNum).optional(),
    h: Joi.string().pattern(regxNum).optional(),
    cache: Joi.boolean().default(true).optional(),
  });

  let url = '';
  let cache: boolean;
  const resize: ResizeOptions = {};
  try {
    const value: ImageParams = await schema.validateAsync(req.query);
    url = value.url;
    value.fit ? (resize.fit = value.fit) : '';
    value.w ? (resize.width = Number(value.w)) : '';
    value.h ? (resize.height = Number(value.h)) : '';
    cache = value.cache;
  } catch (err) {
    return res.status(400).send('参数错误！');
  }

  const findname = md5(url) + '.png';
  const cacheFilePath = path.resolve(cachePath, findname);
  if (!cache) {
    const buffer = await getImage(url, cacheFilePath, resize, false);
    // 返回远程图片
    res.setHeader('Content-Type', ' image/png');
    return res.end(buffer);
  }

  try {
    const cachedImage = await fs.readFileSync(cacheFilePath);
    console.log('cached: ' + cacheFilePath);
    res.setHeader('Content-Type', 'image/png');
    return res.end(cachedImage);
  } catch (error) {
    console.log('uncached: ' + cacheFilePath);
    const buffer = await getImage(url, cacheFilePath, resize, true);
    // 返回远程图片
    res.setHeader('Content-Type', ' image/png');
    return res.end(buffer);
  }
});

export async function startServers(port: number) {
  try {
    await fs.promises.stat(cachePath);
  } catch (error) {
    await fs.promises.mkdir(cachePath, { recursive: true });
  }
  app.use(router);
  // 启动服务器
  app.listen(port, () => {
    console.log('Server is running on port ' + port);
  });
}
// startServers(9000);
