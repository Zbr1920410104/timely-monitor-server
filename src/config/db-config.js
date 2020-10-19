import {
  DEV_DATA_BASE_KEY,
  PRO_DATA_BASE_KEY,
  DEV_DATA_BASE_USER,
  PRO_DATA_BASE_USER
} from '../keys/keys';
import { SAP_CONTROL } from './app-config';
import { ENVIRONMENT } from '../constants/app-constants';

const SQL_CONFIG = {
  // 开发时配置
  [ENVIRONMENT.DEV]: {
    host: 'localhost',
    user: DEV_DATA_BASE_USER,
    password: DEV_DATA_BASE_KEY,
    database: 'softwareTest4',
    port: 3306,
    connectionLimit: 10
  },
  // 测试环境配置
  [ENVIRONMENT.TEST]: {
    host: 'localhost',
    user: 'root',
    password: DEV_DATA_BASE_KEY,
    database: 'softwareTest4',
    port: 3306,
    connectionLimit: 10
  },
  // 生产环境
  [ENVIRONMENT.PRO]: {
    host: 'localhost',
    user: PRO_DATA_BASE_USER,
    password: PRO_DATA_BASE_KEY,
    database: 'softwareTest4',
    port: 3306,
    connectionLimit: 10
  }
};

export default SQL_CONFIG[SAP_CONTROL];
