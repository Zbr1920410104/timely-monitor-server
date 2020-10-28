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
import aipOcrClient2 from '../../util/ocr';

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
  updateBlackList: async ({ monitorUuid, blackList }) => {
    const res = await tblackList.findOne({
      where: { monitorUuid },
      raw: true,
    });

    if (res) {
      await tblackList.update(
        {
          blackList,
        },
        { where: { monitorUuid }, raw: true }
      );
    } else {
      await tblackList.create(
        {
          blackList,
          monitorUuid,
          uuid: uuid.v1(),
        },
        { raw: true }
      );
    }
  },

  ocrTest1: async ({ monitorUuid, monitorNumber }) => {
    await tblackList.findOne({
      where: { monitorUuid },
      attributes: ['blackList'],
      raw: true,
    });

    let num = 0,
      t;
    const screenshots = async () => {
      num++;
      if (num % (monitorNumber + 1) === 0) {
        return;
      }
      console.log(1);
      clearTimeout(t);

      t = setTimeout(async () => {
        await tblackList.findOne({
          where: { monitorUuid },
          attributes: ['blackList'],
          raw: true,
        });
        console.log(2);

        screenshots();
      }, 2000);
    };
    return screenshots();
  },

  /**
   * 测试OCR
   */
  ocrTest: async ({ monitorUuid, monitorNumber }) => {
    const monitor = await tblackList.findOne({
      where: { monitorUuid },
      attributes: ['blackList'],
      raw: true,
    });

    const args = monitor.blackList.replace(/;/g, '|');

    let num = 0,
      t,
      pictureUuid;
    const screenshots = () => {
      num++;
      if (num % (monitorNumber + 1) === 0) {
        return;
      }
      clearTimeout(t);

      t = setTimeout(async () => {
        pictureUuid = uuid.v1();

        await screenshot({
          format: 'png',
          filename: path.resolve(__dirname, `../../tests/${pictureUuid}.png`),
        });

        // newImgBuffer = await sharp(
        //   path.resolve(__dirname, `../../tests/test${num}.png`)
        // )
        //   .composite(
        //     [
        //       {
        //         input: path.resolve(__dirname, '../../tests/warning.png'),
        //         top: 12,
        //         left: 20,
        //       },
        //     ]
        //     // pictureList.map((dot) => {
        //     //   return {
        //     //     input: path.resolve(__dirname, '../../tests/warning.png'),
        //     //     top: dot.top,
        //     //     left: dot.left - 30 > 0 ? dot.left - 30 : 0,
        //     //   };
        //     // })
        //   )
        //   .toBuffer();

        // console.log(newImgBuffer);
        console.log(`Screenshot${num} succeeded!`);
        let image = fs.readFileSync(
          path.resolve(__dirname, `../../tests/${pictureUuid}.png`)
        );
        console.log(image);
        let fileUuid = uuid.v1(),
          fileUrl = `temp/oldPng/${fileUuid}.png`;

        // 上传文件
        await client.put(fileUrl, image);

        let imageStr = image.toString('base64');

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
        await aipOcrClient2
          .accurate(imageStr, options)
          .then((result) => {
            res = result;
          })
          .catch((err) => {
            // 如果发生网络错误
            console.log(err);
          });

        let wordsList = res?.words_result;
        let pictureList = [];

        if (wordsList?.length) {
          for (let i = 0; i < wordsList.length; i++) {
            let str = wordsList[i].words;
            let str1 = str.replace(/\s*/g, '');
            let array = [...str1.matchAll(args)];
            let newArray = array.map((item) => {
              return item.index;
            });

            if (newArray.length) {
              for (let j = 0; j < newArray.length; j++) {
                pictureList.push(wordsList[i].chars[newArray[j]].location);
              }
            }
          }
        }

        let newImg = sharp(
          path.resolve(__dirname, `../../tests/${pictureUuid}.png`)
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

        let newFileUuid = uuid.v1(),
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

        fs.unlinkSync(
          path.resolve(__dirname, `../../tests/${pictureUuid}.png`)
        );

        screenshots();
      }, 3000);
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
