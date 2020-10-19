import user from '../../db/models/t-user';

import uuid from 'uuid';

// mysql
import Sequelize from 'sequelize';
const Op = Sequelize.Op,
  { or } = Sequelize.Op;

// 工具类
import CustomError from '../../util/custom-error';
import webToken from '../../util/token';

// oss
import client from '../../util/oss';
import { db } from '../../db/db-connect';

export default {
  /**
   * 根据uuid查询用户
   */
  selectUserByUuid: async (uuid) => {
    try {
      // 数据库中查询出头像的路径之后去oss获取当前url
      let userInfo = {};

      userInfo = await user.findOne({
        where: { uuid },
        attributes: ['uuid', 'userName', 'password', 'role'],
        raw: true,
      });

      if (!userInfo) {
        throw new CustomError('未查询到此用户');
      }

      return userInfo;
    } catch (error) {
      throw error;
    }
  },
  /**
   * 管理账号登录
   */
  getUserToken: async (userName, password) => {
    try {
      const userInfo = await user.findOne({
        where: {
          userName,
        },
        attributes: ['uuid', 'userName', 'password', 'role'],
        raw: true,
      });

      if (!userInfo || userName !== userInfo.userName) {
        throw new CustomError('账号或密码错误');
      }

      if (!userInfo || userInfo.password !== password) {
        throw new CustomError('账号或密码错误');
      }

      return {
        token: webToken.parseToken({
          uuid: userInfo.uuid,
          auth: 'user',
        }),
        userInfo,
      };
    } catch (error) {
      throw error;
    }
  },
  /**
   * 修改密码
   */
  updateUserPassword: ({ uuid, oldPassword, password }) =>
    user.update(
      {
        password,
      },
      { where: { uuid, password: oldPassword }, raw: true }
    ),
  /**
   * 查找默认密码
   */
  selectDefaultPassword: () =>
    user.findOne({
      where: { role: 1 },
      attributes: ['defaultPassword'],
      raw: true,
    }),

  /**
   * 查询所有账户信息
   */
  queryUsers: () =>
    user.findAll({
      attributes: ['uuid', 'role', 'userName'],
      raw: true,
    }),
};
