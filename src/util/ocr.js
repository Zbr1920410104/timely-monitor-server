import { ocr as AipOcrClient } from 'baidu-aip-sdk';
import { OCR_OPTION } from '../constants/ocr-constants';
import {
  OCR_API_KEY_ONE,
  OCR_SECRET_KEY_ONE,
  OCR_API_KEY_TWO,
  OCR_SECRET_KEY_TWO,
  OCR_API_KEY_THREE,
  OCR_SECRET_KEY_THREE,
  OCR_API_KEY_FOUR,
  OCR_SECRET_KEY_FOUR,
} from '../keys/keys';

const aipOcrClient1 = new AipOcrClient(
  OCR_OPTION.appId1,
  OCR_API_KEY_ONE,
  OCR_SECRET_KEY_ONE
);

const aipOcrClient2 = new AipOcrClient(
  OCR_OPTION.appId2,
  OCR_API_KEY_TWO,
  OCR_SECRET_KEY_TWO
);

const aipOcrClient3 = new AipOcrClient(
  OCR_OPTION.appId3,
  OCR_API_KEY_THREE,
  OCR_SECRET_KEY_THREE
);

const aipOcrClient4 = new AipOcrClient(
  OCR_OPTION.appId4,
  OCR_API_KEY_FOUR,
  OCR_SECRET_KEY_FOUR
);

export default aipOcrClient1;
