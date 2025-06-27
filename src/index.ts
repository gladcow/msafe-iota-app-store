import { CoreHelper } from '@/apps/msafe-core/helper';
import { PlainTransactionHelper } from '@/apps/plain-transaction/helper';
import { PoolsAppHelper } from '@/apps/pools/helper';
import { MSafeApps } from '@/apps/registry';
import { SwirlAppHelper } from '@/apps/swirl/helper';

export const appHelpers = new MSafeApps([
  new CoreHelper(),
  new PlainTransactionHelper(),
  new PoolsAppHelper(),
  new SwirlAppHelper(),
]);
