import { TOKEN_KEY } from '../keys/keys';
import { TOKEN_DURATION } from '../config/system-config';
import jwt from 'jsonwebtoken';

// TOKEN配置项
class Opation {
  constructor() {
    // 按照秒来计算的
    this.duration = Math.floor((Date.now() + TOKEN_DURATION) / 1000);
    this.secret = TOKEN_KEY;
  }
}

export default {
  /**
   * 生成token
   */
  parseToken: data => {
    let opation = new Opation();

    return jwt.sign(
      {
        data,
        exp: opation.duration
      },
      opation.secret
    );
  },

  /**
   * 解析token
   */
  resolveToken: token => {
    try {
      return jwt.verify(token.split(' ')[1], TOKEN_KEY).data;
    } catch (error) {
      throw error;
    }
  }
};
