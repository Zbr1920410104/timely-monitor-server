import tblackList from '../../db/models/t-black-list';

// 工具类
import CustomError from '../../util/custom-error';
import webToken from '../../util/token';
import md5 from 'md5';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import ocrData from './test';

// oss
import client from '../../util/oss';
import { db } from '../../db/db-connect';

// OCR
import aipOcrClient from '../../util/ocr';

export default {
  /**
   * 根据uuid查询黑名单
   */
  selecBlackListByUuid: (uuid) =>
    tblackList.findOne({
      where: { monitorUuid: uuid },
      attributes: ['blackList'],
      raw: true,
    }),

  /**
   * 更新黑名单
   */
  updateBlackList: ({ uuid, blackList }) =>
    tblackList.update(
      {
        blackList,
      },
      { where: { monitorUuid: uuid }, raw: true }
    ),

  /**
   * 测试OCR
   */
  ocrTest: async () => {
    const image = fs
      .readFileSync(path.resolve(__dirname, '../../tests/test.jpg'))
      .toString('base64');

    // 如果有可选参数
    let options = {};
    options['recognize_granularity'] = 'small';
    options['language_type'] = 'CHN_ENG';
    options['detect_direction'] = 'true';
    options['detect_language'] = 'true';
    options['vertexes_location'] = 'true';
    options['probability'] = 'true';
    let res;

    // 带参数调用通用文字识别（含位置信息版）, 图片参数为本地图片
    // await aipOcrClient
    //   .accurate(image, options)
    //   .then((result) => {
    //     res = result;
    //   })
    //   .catch((err) => {
    //     // 如果发生网络错误
    //     console.log(err);
    //   });

    const wordsList = ocrData.words_result;
    let pictureList = [];
    const args = '原图' + '|' + '存在';

    for (let i = 0; i < wordsList.length; i++) {
      const str = wordsList[i].words;
      const str1 = str.replace(/\s*/g, '');

      const array = [...str1.matchAll(args)];

      const newArray = array.map((item) => {
        return item.index;
      });

      for (let j = 0; j < newArray.length; j++) {
        pictureList.push(wordsList[i].chars[newArray[j]].location);
      }
    }

    const img = sharp(
      path.resolve(__dirname, '../../tests/test.jpg')
    ).composite(
      pictureList.map((dot) => {
        return {
          input: path.resolve(__dirname, '../../tests/warning.png'),
          top: dot.top,
          left: dot.left - 30,
        };
      })
    );

    let imgBuffer = await img.toBuffer();

    fs.writeFileSync(
      path.resolve(__dirname, '../../tests/haha.png'),
      imgBuffer
    );

    return res;
  },
};
