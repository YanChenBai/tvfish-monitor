import Joi from 'joi';
import express from 'express';

import { getLiveInfo, getRoomInfo, getRoomInfoManyBili } from './service';
import { Platform, LiveInfoParams } from './type';
import getImage from './image';

import { getResponseBody } from './utils';

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
