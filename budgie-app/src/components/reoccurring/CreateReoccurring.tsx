import React, {
  useCallback,
} from 'react';
import { Reoccurring } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { ReoccurringForm } from './ReoccurringForm';
import { capitalize } from '../../util/util';
import { PageWrapper } from '../PageWrapper';

export const CreateReoccurring = ({ type, onActionDone }: {
  type: 'expense' | 'income',
  onActionDone: () => void
}) => {
  const api = useApi();
  const { showToast } = useToast();

  const createReoccurring = useCallback(async (reoccurringData: Omit<Reoccurring, 'id' | 'is_expense'>) => {
    try {
      await api.post('recurring', {
        ...reoccurringData,
        type,
      });
      onActionDone();
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [api, showToast, type, onActionDone]);

  return (
    <PageWrapper
      title={`Create Reoccurring ${capitalize(type)}`}
    >
      <ReoccurringForm
        onSubmit={createReoccurring}
        forType={type}
      />
    </PageWrapper>
  );
};
