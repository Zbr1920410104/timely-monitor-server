import tchain from '../../db/models/t-chain';
import tblock from '../../db/models/t-block';

// 工具类
import CustomError from '../../util/custom-error';
import webToken from '../../util/token';

// oss
import client from '../../util/oss';
import { db } from '../../db/db-connect';

export default {
  /**
   * 新建区块
   */
  createNewBlock: async (
    newChainStr,
    { index, transactions, previousHash, timestamp, nonce, hash }
  ) => {
    return await Promise.all([
      tchain.update(
        {
          chain: newChainStr,
        },
        { where: { id: 1 }, raw: true }
      ),
      tblock.create({
        index,
        transactions,
        previousHash,
        timestamp,
        nonce,
        hash,
      }),
    ]);
  },
  /**
   * 查询区块信息
   */
  queryAllBlocks: () =>
    tblock.findAll({
      attributes: [
        'index',
        'transactions',
        'previousHash',
        'timestamp',
        'nonce',
        'hash',
      ],
      raw: true,
    }),
};
