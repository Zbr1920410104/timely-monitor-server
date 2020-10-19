import Sequelize from 'sequelize';
import SQL_CONFIG from '../config/db-config';

export const db = new Sequelize(
  SQL_CONFIG.database,
  SQL_CONFIG.user,
  SQL_CONFIG.password,
  {
    host: SQL_CONFIG.host,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    }
  }
);
