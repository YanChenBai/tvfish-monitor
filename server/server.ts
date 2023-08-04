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
import sharp from 'sharp';
const app = express();

interface ImageParams {
  url: string;
  fit?: keyof sharp.FitEnum;
  w?: number;
  h?: number;
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
        qn: Joi.number().optional().default(0),
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
  });

  let url = '';
  const resize: sharp.ResizeOptions = {};
  try {
    const value: ImageParams = await schema.validateAsync(req.query);
    url = value.url;
    value.fit ? (resize.fit = value.fit) : '';
    value.w ? (resize.width = Number(value.w)) : '';
    value.h ? (resize.height = Number(value.h)) : '';
  } catch (err) {
    return res.status(400).send('参数错误！');
  }

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });
  const remoteImageBuffer = response.data;
  const newBuffer = await sharp(remoteImageBuffer)
    .resize(resize)
    .jpeg()
    .toBuffer();

  // 返回远程图片
  res.setHeader('Content-Type', 'JPEG');
  return res.end(newBuffer);
});
export function startServers(port: number) {
  app.use(router);
  // 启动服务器
  app.listen(port, () => {
    console.log('Server is running on port ' + port);
  });
}
// startServers(9000);
