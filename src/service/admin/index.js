import user from '../../db/models/t-user';

// 工具类
import CustomError from '../../util/custom-error';
import webToken from '../../util/token';
import md5 from 'md5';
import uuid from 'uuid';

// oss
import client from '../../util/oss';
import { db } from '../../db/db-connect';

export default {
  /**
   * 新建账户
   */
  createAccount: ({ role, addUserName }) =>
    user.create({
      uuid: uuid.v4(),
      userName: addUserName,
      password: md5('123456'),
      role: role,
    }),
  /**
   * 根据uuid查询用户
   */
  selectAccountByUuid: (uuid) =>
    user.findOne({
      where: { uuid },
      attributes: ['uuid', 'userName', 'password', 'role'],
      raw: true,
    }),
};
