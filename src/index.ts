import { CoreHelper } from '@/apps/msafe-core/helper';
import { PlainTransactionHelper } from '@/apps/plain-transaction/helper';
import { MSafeApps } from '@/apps/registry';

import { VirtueHelper } from './apps/virtue/helper';

export const appHelpers = new MSafeApps([new CoreHelper(), new PlainTransactionHelper(), new VirtueHelper()]);
