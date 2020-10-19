import tchain from '../../db/models/t-chain';
import tblock from '../../db/models/t-block';
import ttransaction from '../../db/models/t-transaction';
import tuser from '../../db/models/t-user';

// 工具类
import CustomError from '../../util/custom-error';
import webToken from '../../util/token';
import uuid from 'uuid';

// oss
import client from '../../util/oss';
import { db } from '../../db/db-connect';

// 加密
import { ec } from 'elliptic';
const ecdsa = new ec('sm2');

export default {
  /**
   * 新建交易
   */
  createNewTransaction: async ({ from, to, amount, signature }) => {
    if (from) {
      const senderBalance = await tuser.findOne({
        attributes: ['amount'],
        where: { publicKey: from },
        raw: true,
      });
      if (+senderBalance.amount < amount) {
        throw new CustomError('账户余额不足');
      }
      return await Promise.all([
        ttransaction.create({
          from,
          to,
          amount,
          signature,
          isInChain: false,
        }),
        tuser.increment(
          { amount: -amount },
          { by: 1, where: { publicKey: from }, raw: true }
        ),
        tuser.increment(
          {
            amount: amount,
          },
          { by: 1, where: { publicKey: to }, raw: true }
        ),
      ]);
    } else {
      return await Promise.all([
        ttransaction.create({
          from,
          to,
          amount,
          signature,
          isInChain: false,
        }),
        tuser.increment(
          {
            amount: amount,
          },
          { by: 1, where: { publicKey: to }, raw: true }
        ),
      ]);
    }
  },

  /**
   * 查询交易信息
   */
  queryTransactions: () =>
    ttransaction.findAll({
      attributes: ['id', 'from', 'to', 'signature', 'amount', 'isInChain'],
      raw: true,
    }),

  /**
   * 查询未入链交易信息
   */
  findTransactionsNotInChain: () =>
    ttransaction.findAll({
      attributes: ['from', 'to', 'signature', 'amount'],
      where: { isInChain: 0 },
      raw: true,
    }),

  /**
   * 将未入链的交易放入区块链
   */
  changeTransactionToInChain: () =>
    ttransaction.update(
      {
        isInChain: true,
      },
      { where: { isInChain: false }, raw: true }
    ),

  /**
   * 新建账户
   */
  createNewAccount: ({ privateKey, publicKey, keyPair }) =>
    tuser.create({
      uuid: uuid.v1(),
      privateKey,
      publicKey,
      keyPair,
      amount: 0,
      role: 5,
    }),

  /**
   * 通过公钥查询私钥
   */
  getPrivateKey: (publicKey) =>
    tuser.findOne({
      attributes: ['privateKey'],
      where: { publicKey },
      raw: true,
    }),

  /**
   * 查找账户是否存在
   */
  getAccountByPublicKey: async (publicKey) => {
    const res = await tuser.findOne({
      attributes: ['publicKey'],
      where: { publicKey },
      raw: true,
    });
    if (res && res.publicKey) {
      return true;
    } else {
      return false;
    }
  },
};
