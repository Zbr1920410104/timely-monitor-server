const Sequelize = require('sequelize');
const { db } = require('../db-connect');

export default db.define('t_picture', {
  uuid: {
    type: Sequelize.STRING(36),
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  monitorUuid: Sequelize.STRING(36),
  consumerUuid: Sequelize.STRING(36),
  consumerName: Sequelize.STRING(36),
  time: Sequelize.TEXT,
  originUrl: Sequelize.TEXT,
  newUrl: Sequelize.TEXT,
  isViolate: Sequelize.BOOLEAN,
});
