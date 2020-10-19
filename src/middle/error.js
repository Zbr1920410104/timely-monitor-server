import { RESPONSE_CODE } from '../constants/domain-constants';
import CustomError from '../util/custom-error';

// 判断是否是业务逻辑错误
const isCustomError = (err) => err instanceof CustomError;

// // 判断是不是权限错误
// const isUnauthorizedError = err => err.status === RESPONSE_CODE.unauthorized;

export default async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);

    if (isCustomError(err)) {
      const msg = err.message || '网络错误,请稍后再试';
      ctx.throw(RESPONSE_CODE.error, msg);
    }

    // if (isUnauthorizedError(err)) {
    //   const msg = '请重新登录';
    //   ctx.throw(RESPONSE_CODE.unauthorized, msg);
    // }

    console.error('代码错误');
    ctx.throw(RESPONSE_CODE.serviceError, '网络错误,请稍后再试');
  }
};
