const Sequelize = require('sequelize');
const { db } = require('../db-connect');

// const tChain = require('./t-chain').default;

const block = db.define('t_block', {
  index: {
    type: Sequelize.BIGINT(7),
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  transactions: Sequelize.TEXT, // 交易内容
  previousHash: Sequelize.STRING(64), // 前一区块哈希值
  timestamp: Sequelize.STRING(64), // 时间戳
  nonce: Sequelize.BIGINT(11), // 挖矿值Nonce
  hash: Sequelize.STRING(64), // 当前区块哈希值
});

// user.hasOne(staffBasic, {
//   foreignKey: 'userUuid',
//   sourceKey: 'uuid',
//   as: 'staffBasic',
// });

export default block;
