import Router from 'koa-router';

const { Chain, Transaction, Block } = require('../../blockChain');
// response
import Res from '../../util/response';
import { RESPONSE_CODE } from '../../constants/domain-constants';

// service
import service from '../../service';

// 中间件
import CustomError from '../../util/custom-error';

const router = new Router({
  prefix: '/chain',
});

router.get('/getChain', async (ctx, next) => {
  try {
    const data = await service.getChain();

    ctx.body = new Res({
      data,
      status: RESPONSE_CODE.success,
      msg: '查询区块链成功',
    });
  } catch (error) {
    throw error;
  }
});

router.post('/createGenesisBlock', async (ctx, next) => {
  try {
    const { difficulty } = ctx.state.param;

    const chain = new Chain(difficulty);
    const block = chain.chain[0];
    console.log(block.transactions);
    const transactions = block.transactions;
    const newTrans = new Transaction(
      transactions[0].from,
      transactions[0].to,
      transactions[0].amount
    );

    chain.transactionPool = JSON.stringify(chain.transactionPool);
    chain.chain = JSON.stringify(chain.chain);

    block.transactions = JSON.stringify(block?.transactions);
    console.log(block, transactions);

    const data = await service.createGenesisBlock(chain, block, newTrans);

    ctx.body = new Res({
      data,
      status: RESPONSE_CODE.success,
      msg: '创建区块链成功',
    });
  } catch (error) {
    throw error;
  }
});

router.get('/getDifficulty', async (ctx, next) => {
  try {
    const data = await service.getDifficulty();

    ctx.body = new Res({
      data,
      status: RESPONSE_CODE.success,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
