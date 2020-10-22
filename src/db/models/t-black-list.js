const Sequelize = require('sequelize');
const { db } = require('../db-connect');

export default db.define('t_black_list', {
  uuid: {
    type: Sequelize.STRING(36),
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  monitorUuid: Sequelize.STRING(36),
  blackList: Sequelize.TEXT,
});
