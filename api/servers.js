const Koa = require('koa');
const Router = require('koa-router');
const { getLiveInfo } = require('./bili_live');
const { getUserInfo, getRoomInfo } = require('./bili_info');
const { getUserInfoDouyu } = require('./douyu_info.js');
const { getRealUrl } = require('./douyu_live');
const cors = require('koa2-cors');

const app = new Koa();
app.use(
  cors({
    origin: '*',
  })
);
const router = new Router();

router.get('/getLiveInfo', async ctx => {
  let roomId = ctx.query.roomId;
  let type = ctx.query.type;
  let qn = ctx.query.qn ? ctx.query.qn : null;
  let line = ctx.query.line ? ctx.query.line : null;
  if (type === 'bili') {
    console.log(qn, line);
    ctx.body = await getLiveInfo(roomId, qn, line);
  } else if (type === 'douyu') {
    ctx.body = await getRealUrl(roomId, qn, line);
  }
});

router.get('/getRoomInfo', async ctx => {
  let roomId = ctx.query.roomId;
  let type = ctx.query.type;
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

  app.listen(port, () => {
    console.log(`监听${port}端口`);
  });
}

startServers(9889);
module.exports = { startServers };
