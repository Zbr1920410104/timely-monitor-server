/**
 * 判断路径是否被排除
 * @param {String} currentPath 当前url
 * @param {Array} unlessPathArr 排除的url数组
 */
export default (currentPath, unlessPathArr) => {
  for (let i = 0; i < unlessPathArr.length; i++) {
    if (currentPath.match(unlessPathArr[i])) {
      return true;
    }
  }

  return false;
};
