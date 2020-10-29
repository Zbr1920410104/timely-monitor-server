import { AUTHORITY } from '../constants/role-constants';
// import Res from '../util/response';
import { RESPONSE_CODE } from '../constants/domain-constants';
import verifyUnlessPath from '../util/verify-unless-path';

// 配置
import { UNLESS_PATH_ARR } from '../config/system-config';

const spliceRoleRouterString = (url) => url.split('/')[1];
const findRole = (roleRouter) => {
  for (let item in AUTHORITY) {
    if (AUTHORITY[item].router === `/${roleRouter}`) {
      return AUTHORITY[item].code;
    }
  }

  return 0;
};
/**
 * 判断管理员权限是否匹配后面的路由
 */
export default async (ctx, next) => {
  if (verifyUnlessPath(ctx.url, UNLESS_PATH_ARR)) {
    await next();
  } else {
    const roleRouter = spliceRoleRouterString(ctx.url);

    if (ctx.state.user.role === findRole(roleRouter)) {
      await next();
    } else if (roleRouter === 'user') {
      await next();
    } else {
      ctx.throw(RESPONSE_CODE.unauthorized);
    }
  }
};
