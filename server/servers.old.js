const Koa = require('koa');
const Router = require('koa-router');
const { getLiveInfo } = require('./bili_live');
const { getUserInfo } = require('./bili_info');
const { getUserInfoDouyu } = require('./douyu_info.js');
const { getRealUrl } = require('./douyu_live');
const getResponseBody = require('./response.js');
const cors = require('koa2-cors');
const Joi = require('joi');

const app = new Koa();
app.use(
  cors({
    origin: '*',
  }),
);
const router = new Router();

router.get('/getLiveInfo', async (ctx) => {
  try {
    const type = await Joi.string()
      .allow('bili', 'douyu')
      .required()
      .validateAsync(ctx.query.type);

    const joiParams = {
      roomId: Joi.number().required(),
      qn: Joi.number().optional().default(0),
      type: Joi.string().allow('bili', 'douyu'),
    };

    if (type === 'bili') {
      const schema = Joi.object({
        ...joiParams,
        line: Joi.number().optional().default(0),
      });
      const value = await schema.validateAsync(ctx.query);
      console.log(value);
      ctx.body = await getLiveInfo(value.roomId, value.qn, value.line);
    } else if (type === 'douyu') {
      const schema = Joi.object({
        ...joiParams,
        line: Joi.string().optional().default('ws-h5'),
      });
      const value = await schema.validateAsync(ctx.query);
      ctx.body = await getRealUrl(value.roomId, value.qn, value.line);
    }
  } catch (error) {
    ctx.body = getResponseBody(400, '请求错误！');
  }
});

router.get('/getRoomInfo', async (ctx) => {
  const roomId = ctx.query.roomId;
  const type = ctx.query.type;
  if (type === 'bili') {
    ctx.body = await getUserInfo(roomId);
  } else if (type === 'douyu') {
    ctx.body = await getUserInfoDouyu(roomId);
  }
});

function startServers(port) {
  // 注册路由
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen(port, () => ({}));
}
startServers(8200);
module.exports = { startServers };
