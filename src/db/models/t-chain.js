const Sequelize = require('sequelize');
const { db } = require('../db-connect');

const chain = db.define('t_chain', {
  transactionPool: Sequelize.TEXT, // 未入链交易
  chain: Sequelize.TEXT, // 区块链数据
  minerReward: Sequelize.BIGINT(3), // 挖矿奖励
  difficulty: Sequelize.BIGINT(3), // 挖矿难度
});

export default chain;
