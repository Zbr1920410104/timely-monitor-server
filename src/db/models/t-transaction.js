const Sequelize = require('sequelize');
const { db } = require('../db-connect');

const transacrtion = db.define('t_transacrtion', {
  from: Sequelize.TEXT, // 发送方地址
  to: Sequelize.TEXT, // 接收方地址
  amount: Sequelize.DECIMAL(16, 8), // 数量
  signature: Sequelize.TEXT, // 数字签名
  isInChain: Sequelize.BOOLEAN, // 交易是否入链
});

export default transacrtion;
