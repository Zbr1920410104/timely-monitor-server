import tchain from '../../db/models/t-chain';
import tblock from '../../db/models/t-block';
import ttransaction from '../../db/models/t-transaction';
import tuser from '../../db/models/t-user';

// 工具类
import CustomError from '../../util/custom-error';
import webToken from '../../util/token';

// oss
import client from '../../util/oss';
import { db } from '../../db/db-connect';

// 加密
import { ec } from 'elliptic';

export default {
  /**
   * 创建初始区块
   */
  createGenesisBlock: async (
    { chain, transactionPool, minerReward, difficulty },
    { transactions, previousHash, timestamp, nonce, hash },
    { from, to, amount }
  ) => {
    const chains = await tchain.findAll({
      attributes: ['chain', 'transactionPool', 'minerReward', 'difficulty'],
      raw: true,
    });
    if (chains.length) {
      throw new CustomError('已存在原始区块链');
    }
    return await Promise.all([
      tchain.create({
        chain,
        transactionPool,
        minerReward,
        difficulty,
      }),
      tblock.create({
        index: 0,
        transactions,
        previousHash,
        timestamp,
        nonce,
        hash,
      }),
      ttransaction.create({
        from,
        to,
        amount,
        isInChain: true,
      }),
      tuser.update(
        {
          amount,
        },
        { where: { publicKey: to }, raw: true }
      ),
    ]);
  },

  /**
   * 查询区块链信息
   */
  getChain: () =>
    tchain.findOne({
      attributes: ['chain', 'transactionPool', 'minerReward', 'difficulty'],
      raw: true,
    }),

  /**
   * 查询交易池
   */
  getTransactionPool: () =>
    tchain.findOne({
      attributes: ['transactionPool'],
      raw: true,
    }),

  /**
   * 保存交易池
   */
  saveTransactionToChain: (strTrans) =>
    tchain.update(
      {
        transactionPool: strTrans,
      },
      { where: { id: 1 }, raw: true }
    ),

  /**
   * 删除交易池
   */
  deleteTransactionPool: () =>
    tchain.update(
      {
        transactionPool: '[]',
      },
      { where: { id: 1 }, raw: true }
    ),

  /**
   * 获取难度值
   */
  getDifficulty: () =>
    tchain.findOne({
      attributes: ['difficulty'],
      raw: true,
    }),
};
