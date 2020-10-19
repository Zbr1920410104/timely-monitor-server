export default class Result {
  constructor({ data = {}, status = 200, msg = '' }) {
    this.status = status;
    this.data = data;
    this.msg = msg;
  }
}
