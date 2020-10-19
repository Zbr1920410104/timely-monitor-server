import OSS from 'ali-oss';
import { OSS_OPTION } from '../constants/oss-constants';
import { ACCESS_KEY_ID, ACCESS_KEY_SECRET } from '../keys/keys';

export default new OSS({
  region: OSS_OPTION.region,
  bucket: OSS_OPTION.bucket,
  accessKeyId: ACCESS_KEY_ID,
  accessKeySecret: ACCESS_KEY_SECRET
});
