/**
 * 将参数统一化,都放到state.param中
 */
export default async (ctx, next) => {
  if (
    ctx.method === 'POST' ||
    ctx.method === 'PUT' ||
    ctx.method === 'DELETE'
  ) {
    ctx.state.param = ctx.request.body;

    await next();
  } else if (ctx.method === 'GET') {
    ctx.state.param = ctx.request.query;
    await next();
  }
};
