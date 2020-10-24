require('@babel/register')({
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '12.13.1',
        },
      },
    ],
  ],
  plugins: ['@babel/plugin-proposal-optional-chaining'],
});

const uuid = require('uuid');
const md5 = require('md5');
const tblacklist = require('./models/t-black-list').default;
require('./models/t-picture').default;
const user = require('./models/t-user').default;
const sequelize = require('./db-connect');

Promise.all([
  // 先创建所有数据表
  sequelize.db.sync({
    force: true,
  }),
])
  .then(() => {
    Promise.all([
      user.create({
        uuid: uuid.v4(),
        userName: 'admin',
        password: md5('123456'),
        role: 1,
      }),
      user.create({
        uuid: 'iamamonitor',
        userName: 'monitor1',
        password: md5('123456'),
        role: 5,
      }),
      tblacklist.create({
        uuid: uuid.v4(),
        monitorUuid: 'iamamonitor',
        blackList: '不存在;欢迎;开发;介绍;合理;原图;密码;java',
      }),
    ]);
  })
  .then(() => {
    console.log('===数据库初始化成功===');
  })
  .catch((err) => {
    console.error('数据库初始化出错啦', err);
  });
