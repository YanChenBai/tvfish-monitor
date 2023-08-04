"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServers = void 0;
const joi_1 = __importDefault(require("joi"));
const express_1 = __importDefault(require("express"));
const live_1 = require("./bili/live");
const info_1 = require("./bili/info");
const info_2 = require("./douyu/info");
const live_2 = require("./douyu/live");
const utils_1 = require("./utils");
const axios_1 = __importDefault(require("axios"));
const sharp_1 = __importDefault(require("sharp"));
const app = (0, express_1.default)();
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});
const router = express_1.default.Router();
router.get('/getLiveInfo', async (req, res) => {
    try {
        const type = await joi_1.default.string()
            .allow('bili', 'douyu')
            .required()
            .validateAsync(req.query.type);
        const joiParams = {
            roomId: joi_1.default.number().required(),
            type: joi_1.default.string().allow('bili', 'douyu'),
        };
        if (type === 'bili') {
            const schema = joi_1.default.object({
                ...joiParams,
                qn: joi_1.default.number().optional().default(null),
                line: joi_1.default.number().optional().default(0),
            });
            const value = await schema.validateAsync(req.query);
            res.json(await (0, live_1.getLiveInfo)(value.roomId, value.qn, value.line));
        }
        else if (type === 'douyu') {
            const schema = joi_1.default.object({
                ...joiParams,
                qn: joi_1.default.number().optional().default(0),
                line: joi_1.default.string().optional().default('ws-h5'),
            });
            const value = await schema.validateAsync(req.query);
            res.json(await (0, live_2.getRealUrl)(value.roomId, value.qn, value.line));
        }
    }
    catch (error) {
        res.json((0, utils_1.getResponseBody)(400, '请求错误！'));
    }
});
router.get('/getRoomInfo', async (req, res) => {
    const roomId = req.query.roomId;
    const type = req.query.type;
    if (type === 'bili') {
        res.json(await (0, info_1.getUserInfo)(roomId));
    }
    else if (type === 'douyu') {
        res.json(await (0, info_2.getUserInfoDouyu)(roomId));
    }
});
router.get('/img', async function name(req, res) {
    const regxUrl = /^(https?:\/\/(?:[\w-]+\.)+[\w-]+)/i;
    const regxNum = /^\d+(\.\d+)?$/i;
    const schema = joi_1.default.object({
        url: joi_1.default.string().pattern(regxUrl).required(),
        fit: joi_1.default.string()
            .valid('contain', 'cover', 'fill', 'inside', 'outside')
            .optional(),
        w: joi_1.default.string().pattern(regxNum).optional(),
        h: joi_1.default.string().pattern(regxNum).optional(),
    });
    let url = '';
    const resize = {};
    try {
        const value = await schema.validateAsync(req.query);
        url = value.url;
        value.fit ? (resize.fit = value.fit) : '';
        value.w ? (resize.width = Number(value.w)) : '';
        value.h ? (resize.height = Number(value.h)) : '';
    }
    catch (err) {
        return res.status(400).send('参数错误！');
    }
    const response = await axios_1.default.get(url, {
        responseType: 'arraybuffer',
    });
    const remoteImageBuffer = response.data;
    const newBuffer = await (0, sharp_1.default)(remoteImageBuffer)
        .resize(resize)
        .jpeg()
        .toBuffer();
    // 返回远程图片
    res.setHeader('Content-Type', 'JPEG');
    return res.end(newBuffer);
});
function startServers(port) {
    app.use(router);
    // 启动服务器
    app.listen(port, () => {
        console.log('Server is running on port ' + port);
    });
}
exports.startServers = startServers;
// startServers(9000);
//# sourceMappingURL=server.js.map