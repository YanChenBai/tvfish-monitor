const { getLiveInfo } = require('./bili_live');
const { getUserInfo } = require('./bili_info');
const { getUserInfoDouyu } = require('./douyu_info.js');
const { getRealUrl } = require('./douyu_live');
const getResponseBody = require('./response.js');
const Joi = require('joi');
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const app = express();

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

app.use('/img', async function name(req, res, next) {
  try {
    delete req.headers.referer;
    delete req.headers.origin;
    delete req.headers.host;

    const url = req.query.url;
    const regx = /^(https?:\/\/(?:[\w-]+\.)+[\w-]+)/i;

    const tmp = url.match(regx);
    if (tmp === null) {
      next();
      return;
    }
    const domain = tmp[0];
    const suffix = url.replace(domain, '');
    console.log(domain, suffix);

    // // 创建代理中间件，并设重设请求头
    const proxy = createProxyMiddleware({
      target: domain,
      changeOrigin: true,
      cookieDomainRewrite: { '*': '' },
      pathRewrite: {
        '^/img': suffix,
      },
    });

    // 调用代理中间件处理请求
    proxy(req, res, () => {
      // 如果没有触发代理中间件，则继续处理下一个中间件
      next();
    });
  } catch (error) {
    // 处理异常
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const router = express.Router();

router.get('/getLiveInfo', async (req, res, next) => {
  try {
    const type = await Joi.string()
      .allow('bili', 'douyu')
      .required()
      .validateAsync(req.query.type);

    const joiParams = {
      roomId: Joi.number().required(),
      qn: Joi.number().optional().default(null),
      type: Joi.string().allow('bili', 'douyu'),
    };

    if (type === 'bili') {
      const schema = Joi.object({
        ...joiParams,
        line: Joi.number().optional().default(0),
      });
      const value = await schema.validateAsync(req.query);
      console.log(value);
      res.json(await getLiveInfo(value.roomId, value.qn, value.line));
    } else if (type === 'douyu') {
      const schema = Joi.object({
        ...joiParams,
        line: Joi.string().optional().default('ws-h5'),
      });
      const value = await schema.validateAsync(req.query);
      res.json(await getRealUrl(value.roomId, value.qn, value.line));
    }
  } catch (error) {
    res.json(getResponseBody(400, '请求错误！'));
  }
});

router.get('/getRoomInfo', async (req, res, next) => {
  const roomId = req.query.roomId;
  const type = req.query.type;
  if (type === 'bili') {
    res.json(await getUserInfo(roomId));
  } else if (type === 'douyu') {
    res.json(await getUserInfoDouyu(roomId));
  }
});

function startServers(port) {
  app.use(router);
  // 启动服务器
  app.listen(port, () => {
    console.log('Server is running on port ' + port);
  });
}
startServers(9000);
module.exports = { startServers };
