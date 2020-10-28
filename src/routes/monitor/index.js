import Router from 'koa-router';

// response
import Res from '../../util/response';
import { RESPONSE_CODE } from '../../constants/domain-constants';

// service
import service from '../../service';

// 中间件
import CustomError from '../../util/custom-error';

const router = new Router({
  prefix: '/monitor',
});

/**
 * 查看黑名单
 */
router.get('/selectBlackList', async (ctx, next) => {
  try {
    let { uuid } = ctx.state.user;

    const data = await service.selecBlackListByUuid(uuid);

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * 保存黑名单
 */
router.post('/saveBlackList', async (ctx, next) => {
  try {
    let { uuid } = ctx.state.user;
    let { blackList } = ctx.state.param;

    const data = await service.updateBlackList({
      monitorUuid: uuid,
      blackList,
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
 * 测试OCR
 */
router.post('/ocrTest', async (ctx, next) => {
  try {
    let { uuid } = ctx.state.user;

    let { monitorNumber } = ctx.state.param;

    const data = await service.ocrTest({ monitorUuid: uuid, monitorNumber });

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * 查看黑名单
 */
router.get('/getMonitorList', async (ctx, next) => {
  try {
    let { uuid } = ctx.state.user;

    const data = await service.getMonitorList(uuid);

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * 查看黑名单
 */
router.get('/getPicture', async (ctx, next) => {
  try {
    let { uuid } = ctx.state.user;
    let { isOpened, foreTime, laterTime } = ctx.state.param;

    const data = await service.getPicture({
      isOpened,
      uuid,
      foreTime,
      laterTime,
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
 * 获取图片
 */
router.get('/getFileUrl', async (ctx, next) => {
  try {
    let { url } = ctx.state.param;

    const data = await service.getFileUrl(url);

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
