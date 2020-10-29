import Router from 'koa-router';

// response
import Res from '../../util/response';
import { RESPONSE_CODE } from '../../constants/domain-constants';

// service
import service from '../../service';

// 中间件
import CustomError from '../../util/custom-error';

const router = new Router({
  prefix: '/consumer',
});

/**
 * 测试OCR
 */
router.post('/ocrTest', async (ctx, next) => {
  try {
    let { uuid, userName } = ctx.state.user;

    const msg = await service.ocrTest1({ consumerUuid: uuid, userName });

    ctx.body = new Res({
      status: RESPONSE_CODE.success,
      data: msg,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
