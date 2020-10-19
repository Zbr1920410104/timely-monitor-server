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
require('./models/t-block').default;
require('./models/t-chain').default;
require('./models/t-transaction').default;
// const account = require('./models/t-account').default;
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
        uuid: uuid.v1(),
        userName: 'admin',
        password: md5('123456'),
        role: 1,
      }),
      user.create({
        uuid: uuid.v1(),
        privateKey:
          '54781a9122036a7b59b40c78cb9720f7b6db1eece266257c0b69e1de3e2ab52f',
        publicKey:
          '047437e0b581ce2dae8a44d1bac9d62d110fcbf46d8fd51798da7958a40c7a5da26eebce044e5d424f161aff9e119096b394d802b66559cfab03499cb46daede14',
        amount: 0,
        role: 5,
      }),
    ]);
  })
  .then(() => {
    console.log('===数据库初始化成功===');
  })
  .catch((err) => {
    console.error('数据库初始化出错啦', err);
  });
