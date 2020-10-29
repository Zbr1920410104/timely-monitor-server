import monitorService from './monitor/index';
import adminService from './admin/index';
import userService from './user/index';
import consumerService from './consumer/index';

export default {
  ...monitorService,
  ...userService,
  ...adminService,
  ...consumerService,
};
