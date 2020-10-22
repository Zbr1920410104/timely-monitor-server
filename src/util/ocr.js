import { ocr as AipOcrClient } from 'baidu-aip-sdk';
import { OCR_OPTION } from '../constants/ocr-constants';
import { OCR_API_KEY_TWO, OCR_SECRET_KEY_TWO } from '../keys/keys';

export default new AipOcrClient(
  OCR_OPTION.appId2,
  OCR_API_KEY_TWO,
  OCR_SECRET_KEY_TWO
);
