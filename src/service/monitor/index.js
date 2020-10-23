import tblackList from '../../db/models/t-black-list';
import tpicture from '../../db/models/t-picture';

// 工具类
import CustomError from '../../util/custom-error';
import webToken from '../../util/token';
import md5 from 'md5';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import ocrData from './test';
import uuid from 'uuid';
import moment from 'moment';
import screenshot from 'screenshot-desktop';

// oss
import client from '../../util/oss';
import { db } from '../../db/db-connect';

// OCR
import aipOcrClient1 from '../../util/ocr';

// mysql
import Sequelize from 'sequelize';
const { gt, lt, and } = Sequelize.Op;

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
  ocrTest: async (monitorUuid) => {
    const monitor = await tblackList.findOne({
      where: { monitorUuid },
      attributes: ['blackList'],
      raw: true,
    });

    const args = monitor.blackList.replace(/;/g, '|');

    let num = 0,
      t;
    const screenshots = () => {
      clearTimeout(t);
      num++;
      if (num % 2 === 0) {
        return;
      }

      t = setTimeout(async () => {
        await screenshot({
          format: 'png',
          filename: path.resolve(__dirname, `../../tests/test.png`),
        })
          .then((img) => {
            console.log(`Screenshot${num} succeeded!`);
          })
          .catch((err) => {
            console.log(`Screenshot${num} failed!`);
          });

        const image = await fs.readFileSync(
          path.resolve(__dirname, '../../tests/test.png')
        );

        const fileUuid = uuid.v1(),
          fileUrl = `temp/oldPng/${fileUuid}.png`;

        // 上传文件
        await client.put(fileUrl, image);

        const imageStr = image.toString('base64');

        // 可选参数
        let options = {},
          res;
        options['recognize_granularity'] = 'small';
        options['language_type'] = 'CHN_ENG';
        options['detect_direction'] = 'true';
        options['detect_language'] = 'true';
        options['vertexes_location'] = 'true';
        options['probability'] = 'true';

        // 带参数调用通用文字识别（含位置信息版）, 图片参数为本地图片
        await aipOcrClient1
          .accurate(imageStr, options)
          .then((result) => {
            res = result;
          })
          .catch((err) => {
            // 如果发生网络错误
            console.log(err);
          });

        const wordsList = res.words_result;
        let pictureList = [];

        for (let i = 0; i < wordsList.length; i++) {
          const str = wordsList[i].words;
          const str1 = str.replace(/\s*/g, '');

          const array = [...str1.matchAll(args)];

          const newArray = array.map((item) => {
            return item.index;
          });

          for (let j = 0; j < newArray.length; j++) {
            // console.log(wordsList[i].chars[newArray[j]]);
            pictureList.push(wordsList[i].chars[newArray[j]].location);
          }
        }

        const newImg = await sharp(
          path.resolve(__dirname, '../../tests/test.png')
        ).composite(
          pictureList.map((dot) => {
            return {
              input: path.resolve(__dirname, '../../tests/warning.png'),
              top: dot.top,
              left: dot.left - 30 > 0 ? dot.left - 30 : 0,
            };
          })
        );

        let newImgBuffer = await newImg.toBuffer();

        const newFileUuid = uuid.v1(),
          newUrl = `temp/newPng/${newFileUuid}.png`;

        // 上传文件
        await client.put(newUrl, newImgBuffer);

        await tpicture.create({
          uuid: fileUuid,
          monitorUuid,
          time: moment().format('YYYY-MM-DD HH:mm:ss'),
          originUrl: fileUrl,
          newUrl,
          isViolate: pictureList.length ? 1 : 0,
        });

        screenshots();
      }, 5000);
    };

    return screenshots();
  },

  /**
   * 根据uuid查询监控列表
   */
  getMonitorList: (uuid) =>
    tpicture.findAll({
      where: { monitorUuid: uuid },
      attributes: ['uuid', 'time', 'originUrl', 'newUrl', 'isViolate'],
      order: [['time', 'DESC']],
      raw: true,
    }),

  /**
   * 获取文件地址
   */
  getFileUrl: (url) => client.signatureUrl(url),

  /**
   * 根据uuid查询图片
   */
  getPicture: async ({ isOpened, uuid, foreTime, laterTime }) => {
    if (isOpened === 'true') {
      return await tpicture.findAll({
        where: { monitorUuid: uuid },
        attributes: ['uuid', 'time', 'newUrl'],
        order: [['time', 'DESC']],
        limit: 10,
        raw: true,
      });
    } else {
      return await tpicture.findAll({
        where: {
          monitorUuid: uuid,
          [and]: [{ time: { [gt]: foreTime } }, { time: { [lt]: laterTime } }],
        },
        attributes: ['uuid', 'time', 'newUrl'],
        order: [['time', 'DESC']],
        limit: 10,
        raw: true,
      });
    }
  },
};
