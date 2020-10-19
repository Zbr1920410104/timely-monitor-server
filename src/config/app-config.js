// 环境控制
export const SAP_CONTROL = process.env.NODE_ENV;

// 项目版本号
export const kAppVersion = 'v0.0.1';

/*
    项目内部版本号
    规则: 1.0.0     版本为    10000000
          99.99.99  版本为   999999000
          后三位为打包测试时使用 每打包一次+1
 */
export const kAPPInfo_Appversion = '00000001';
