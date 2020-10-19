const Sequelize = require('sequelize');
const { db } = require('../db-connect');

const account = db.define('t_account', {
  index: {
    type: Sequelize.BIGINT(7),
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    unique: true,
  },
  privateKey: Sequelize.TEXT,
  publicKey: Sequelize.TEXT,
  amount: Sequelize.DECIMAL(16, 8),
});

export default account;
