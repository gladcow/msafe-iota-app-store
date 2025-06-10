import { TransactionType } from '@msafe/iota-utils';

import { VirtueIntentionData } from '@/apps/virtue/types/helper';

export enum TransactionSubType {
  ManagePosition = 'manage-position',
}

export type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: VirtueIntentionData;
};
