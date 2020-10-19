import Router from 'koa-router';

import { Chain, Transaction, Block } from '../../blockChain';
// response
import Res from '../../util/response';
import { RESPONSE_CODE } from '../../constants/domain-constants';

// service
import service from '../../service';

// 中间件
import CustomError from '../../util/custom-error';

const router = new Router({
  prefix: '/block',
});

router.post('/mineToCreateNewBlock', async (ctx, next) => {
  try {
    const { publicKey } = ctx.state.param;
    const res = await service.getChain();
    const chainStr = res.chain;
    const chain = JSON.parse(chainStr);
    const index = chain.length;
    const previousHash = chain[index - 1].hash;
    const transactions = await service.findTransactionsNotInChain();
    const block = new Block(transactions, previousHash, index);
    block.mine(res.difficulty);
    block.transactions = JSON.stringify(block.transactions);
    const newChain = [...chain, block];
    const newChainStr = JSON.stringify(newChain);

    const data = await service.createNewBlock(newChainStr, block);
    await service.deleteTransactionPool();
    await service.changeTransactionToInChain();
    await service.createNewTransaction({
      from: '',
      to: publicKey,
      amount: 50,
      signature: '',
    });

    ctx.body = new Res({
      data,
      status: RESPONSE_CODE.success,
      msg: '创建区块成功',
    });
  } catch (error) {
    throw error;
  }
});

router.get('/getAllBlocks', async (ctx, next) => {
  try {
    const data = await service.queryAllBlocks();

    ctx.body = new Res({
      data,
      status: RESPONSE_CODE.success,
      msg: '查询区块成功',
    });
  } catch (error) {
    throw error;
  }
});

export default router;
