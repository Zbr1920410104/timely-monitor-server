import blockService from './block/index';
import chainService from './chain/index';
import transactionService from './transaction/index';
import userService from './user/index';

export default {
  ...blockService,
  ...chainService,
  ...transactionService,
  ...userService,
};
