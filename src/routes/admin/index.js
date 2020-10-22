import Router from 'koa-router';

// response
import Res from '../../util/response';
import { RESPONSE_CODE } from '../../constants/domain-constants';

// service
import service from '../../service';

// 中间件
import CustomError from '../../util/custom-error';

const router = new Router({
  prefix: '/admin',
});

/**
 * 新建账户
 */
router.post('/createAccount', async (ctx, next) => {
  try {
    let { role, addUserName } = ctx.state.param;

    const data = await service.createAccount({
      role,
      addUserName,
    });

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * 新建账户
 */
router.get('/selectAccount', async (ctx, next) => {
  try {
    let { uuid } = ctx.state.param;

    const data = await service.selectAccountByUuid(uuid);

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * 更新账户
 */
router.post('/updateAccount', async (ctx, next) => {
  try {
    let { role, modifyUserName, uuid } = ctx.state.param;

    const data = await service.updateAccount({
      role,
      userName: modifyUserName,
      uuid,
    });

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * 删除账户
 */
router.post('/deleteAccount', async (ctx, next) => {
  try {
    let { uuid } = ctx.state.param;

    const data = await service.deleteAccount(uuid);

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
