const Sequelize = require('sequelize');
const { db } = require('../db-connect');

export default db.define('t_user', {
  uuid: {
    type: Sequelize.STRING(36),
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  role: Sequelize.BIGINT(3), // 权限
  userName: Sequelize.STRING(32), // 用户名
  password: Sequelize.STRING(32),
});
