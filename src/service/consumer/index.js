import tblackList from '../../db/models/t-black-list';
import tpicture from '../../db/models/t-picture';
import user from '../../db/models/t-user';

// 工具类
import CustomError from '../../util/custom-error';
import webToken from '../../util/token';
import md5 from 'md5';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
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
  ocrTest: async (uuid) => {
    let monitorRes = await user.findOne({
      where: { uuid },
      attributes: ['monitorUuid'],
      raw: true,
    });

    let blackListRes = await tblackList.findOne({
      where: { monitorUuid: monitorRes.monitorUuid },
      attributes: ['blackList'],
      raw: true,
    });

    console.log(blackListRes.blackList);

    return blackListRes.blackList;
  },

  /**
   * 测试OCR
   */
  ocrTest1: async ({ consumerUuid, userName }) => {
    let monitorRes = await user.findOne({
      where: { uuid: consumerUuid },
      attributes: ['monitorUuid'],
      raw: true,
    });

    let blackListRes = await tblackList.findOne({
      where: { monitorUuid: monitorRes.monitorUuid },
      attributes: ['blackList'],
      raw: true,
    });

    const args = blackListRes.blackList.replace(/;/g, '|');

    let msg = '',
      pictureUuid;

    // const screenshots = () => {
    //   num++;
    //   if (num % 2 === 0) {
    //     return;
    //   }
    //   clearTimeout(t);

    //   t = setTimeout(async () => {
    pictureUuid = uuid.v1();

    await screenshot({
      format: 'png',
      filename: path.resolve(__dirname, `../../../../timely-monitor-com/public/tests/${pictureUuid}.png`),
    });

    console.log(`Screenshot succeeded!`);
    let image = fs.readFileSync(
      path.resolve(__dirname, `../../../../timely-monitor-com/public/tests/${pictureUuid}.png`)
    );

    let fileUuid = uuid.v1();
    // fileUrl = `temp/oldPng/${fileUuid}.png`;

    //  上传文件
    // await client.put(fileUrl, image);

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
    await aipOcrClient1
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

    let newFileUuid = uuid.v1();

    sharp(
      path.resolve(__dirname, `../../../../timely-monitor-com/public/tests/${pictureUuid}.png`)
    ).composite(
      pictureList.map((dot) => {
        return {
          input: path.resolve(__dirname, '../../../../timely-monitor-com/public/tests/warning.png'),
          top: dot.top,
          left: dot.left - 30 > 0 ? dot.left - 30 : 0,
        };
      })
    ).toFile(path.resolve(__dirname, `../../../../timely-monitor-com/public/images/${newFileUuid}.png`), (err, info) => {
      console.log(err)
    });

    if (pictureList.length) {
      msg = '出现违规内容!';
    }

    // let newImgBuffer = await newImg.toBuffer();

    // let newFileUuid = uuid.v1(),
    //   newUrl = `temp/newPng/${newFileUuid}.png`;

    // 上传文件
    // await client.put(newUrl, newImgBuffer);

    await tpicture.create({
      uuid: fileUuid,
      monitorUuid: monitorRes.monitorUuid,
      consumerUuid,
      consumerName: userName,
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      originUrl: `${pictureUuid}.png`,
      newUrl: `${newFileUuid}.png`,
      isViolate: pictureList.length ? 1 : 0,
    });

    // fs.unlinkSync(path.resolve(__dirname, `../../tests/${pictureUuid}.png`));

    return msg;

    //     screenshots();
    //   }, 3000);
    // };

    // return screenshots();
  },
};
