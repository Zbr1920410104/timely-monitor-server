import monitorService from './monitor/index';
import adminService from './admin/index';
import userService from './user/index';

export default {
  ...monitorService,
  ...userService,
  ...adminService,
};
