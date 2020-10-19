import Koa from 'koa';
import json from 'koa-json';
import onerror from 'koa-onerror';
import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';

// 跨域
import cors from 'koa2-cors';

// 路由
import monitors from './src/routes/monitor/index';
import admins from './src/routes/admin/index';
import users from './src/routes/user/index';

// 中间件
import verifyToken from './src/middle/verify-token';
import param from './src/middle/param';
import verifyAuth from './src/middle/verify-auth';
import error from './src/middle/error';

// 返回前台的对象
import Result from './src/util/response';

const app = new Koa();

app.use(cors()); // 跨域

// error handler
onerror(app); // 错误处理

// middlewares
app.use(
  // 处理程序之前，在中间件中对传入的请求体进行解析(设置了三种解析方式)
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  })
);
app.use(json()); // JSON响应中间件
app.use(logger()); // 记录中间件
app.use(error); // 报错信息,自定义中间件
app.use(require('koa-static')(__dirname + '/public')); // 处理静态资源
app.use(verifyToken);
app.use(verifyAuth);
app.use(param); // 处理请求类型,自定义中间件

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(monitors.routes(), monitors.allowedMethods());
app.use(admins.routes(), admins.allowedMethods());
app.use(users.routes(), users.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  ctx.res.writeHead(err.statusCode || err.status, {
    'content-Type': 'application/json',
  });
  ctx.res.end(
    JSON.stringify(
      new Result({
        status: err.statusCode || err.status,
        msg: err.message,
      })
    )
  );
  console.error('server error', err, ctx);
});

module.exports = app;
