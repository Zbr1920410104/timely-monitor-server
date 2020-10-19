import Router from 'koa-router';

import { Chain, Transaction, Block } from '../../blockChain';
// response
import Res from '../../util/response';
import { RESPONSE_CODE } from '../../constants/domain-constants';

// service
import service from '../../service';

// 加密
import { ec } from 'elliptic';

// 中间件
import CustomError from '../../util/custom-error';

const router = new Router({
  prefix: '/transaction',
});

router.post('/createNewTransaction', async (ctx, next) => {
  try {
    const { from, to, amount } = ctx.state.param;
    const publicKeySender = from,
      publicKeyReceiver = to;
    const ecdsa = new ec('sm2');
    const privateKey = await service.getPrivateKey(publicKeySender);
    if (!privateKey || !privateKey.privateKey) {
      throw new CustomError('发送方地址错误');
    }
    const isReceiverExist = await service.getAccountByPublicKey(
      publicKeyReceiver
    );
    if (!isReceiverExist) {
      throw new CustomError('接收方地址错误');
    }
    const senderKeyPair = ecdsa.keyFromPrivate(privateKey.privateKey, 'hex');

    const tx = new Transaction(publicKeySender, publicKeyReceiver, +amount);
    tx.sign(senderKeyPair);

    if (!tx.isValid()) {
      throw new CustomError('验签不通过');
    }

    const res = await service.getTransactionPool();
    if (res && res.transactionPool) {
      const transactionPool = JSON.parse(res.transactionPool);
      transactionPool.push(tx);
      const strTrans = JSON.stringify(transactionPool);
      await service.saveTransactionToChain(strTrans);
    }

    const data = await service.createNewTransaction(tx);

    ctx.body = new Res({
      data,
      status: RESPONSE_CODE.success,
      msg: '新建交易成功',
    });
  } catch (error) {
    throw error;
  }
});

router.get('/getAllTransactions', async (ctx, next) => {
  try {
    const data = await service.queryTransactions();

    ctx.body = new Res({
      data,
      status: RESPONSE_CODE.success,
      msg: '查询交易成功',
    });
  } catch (error) {
    throw error;
  }
});

router.post('/createNewAccount', async (ctx, next) => {
  try {
    const ecdsa = new ec('sm2');
    const keyPairAccount = ecdsa.genKeyPair();
    const privateKeyAccount = keyPairAccount.getPrivate('hex'); // 私钥
    const publicKeyAccount = keyPairAccount.getPublic('hex'); // 公钥
    const keyPair = JSON.stringify(keyPairAccount);
    const data = await service.createNewAccount({
      privateKey: privateKeyAccount,
      publicKey: publicKeyAccount,
      keyPair,
    });

    ctx.body = new Res({
      data,
      status: RESPONSE_CODE.success,
      msg: '新建账户成功',
    });
  } catch (error) {
    throw error;
  }
});

export default router;
