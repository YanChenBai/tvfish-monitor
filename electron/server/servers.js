const Koa = require('koa');
const Router = require('koa-router');
const { getLiveInfo } = require('./bili_live');
const { getUserInfo } = require('./bili_info');
const { getUserInfoDouyu } = require('./douyu_info.js');
const { getRealUrl } = require('./douyu_live');
const cors = require('koa2-cors');

const app = new Koa();
app.use(
  cors({
    origin: '*',
  }),
);
const router = new Router();

router.get('/getLiveInfo', async (ctx) => {
  const roomId = ctx.query.roomId;
  const type = ctx.query.type;
  const qn = ctx.query.qn ? ctx.query.qn : null;
  const line = ctx.query.line ? ctx.query.line : null;
  if (type === 'bili') {
    ctx.body = await getLiveInfo(roomId, qn, line);
  } else if (type === 'douyu') {
    ctx.body = await getRealUrl(roomId, qn, line);
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

module.exports = { startServers };
