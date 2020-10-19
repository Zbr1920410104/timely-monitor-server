import Router from 'koa-router';

// response
import Res from '../../util/response';
import { RESPONSE_CODE } from '../../constants/domain-constants';

// 工具类
import CustomError from '../../util/custom-error';
import md5 from 'md5';

// service
import service from '../../service';

const router = new Router({
  prefix: '/user',
});

/**
 * 通过token获取自己信息
 */
router.get('/getMyInfo', async (ctx, next) => {
  try {
    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data: ctx.state.user,
    });
  } catch (error) {
    ctx.throw(RESPONSE_CODE.unauthorized);
  }
});

/**
 * 管理端登录
 */
router.get('/getUserToken', async (ctx, next) => {
  try {
    let { userName, password } = ctx.state.param;

    const token = await service.getUserToken(userName, password);

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data: token,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * 修改密码
 */
router.post('/savePassword', async (ctx, next) => {
  try {
    const { oldPassword, newPassword } = ctx.state.param;

    const uuid = ctx.state.user.uuid;

    if (newPassword === '123456') {
      throw error;
    }

    const data = await service.updateUserPassword({
      uuid,
      oldPassword: md5(oldPassword),
      password: md5(newPassword),
    });

    if (data[0]) {
      ctx.body = new Res({
        status: RESPONSE_CODE.success,
        data,
        msg: '密码修改成功',
      });
    } else {
      throw new CustomError('原始密码输入错误');
    }
  } catch (error) {
    throw new CustomError('新密码不可与初始密码相同');
  }
});

/**
 * 查询个人信息
 */
router.get('/selectUserByUuid', async (ctx, next) => {
  try {
    const data = await service.selectUserByUuid();

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * 查询所有账户信息
 */
router.get('/getAllUsers', async (ctx, next) => {
  try {
    const data = await service.queryUsers();

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
