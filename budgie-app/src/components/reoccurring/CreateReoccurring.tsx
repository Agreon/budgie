import React, {
  useCallback,
} from 'react';
import { View, ScrollView } from 'react-native';
import tailwind from 'tailwind-rn';
import { Header } from '../Header';
import { BackAction } from '../BackAction';
import { Reoccurring } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { ReoccurringForm } from './ReoccurringForm';
import { capitalize } from '../../util/util';

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

  // TODO: Maybe extract this ScrollView + Header stuff
  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      style={tailwind('bg-white h-full w-full')}
    >
      <Header
        title={`Create Reoccurring ${capitalize(type)}`}
        accessoryLeft={props => <BackAction {...props} />}
      />
      <View style={tailwind('flex pl-5 pr-5')}>
        <ReoccurringForm
          onSubmit={createReoccurring}
        />
      </View>
    </ScrollView>
  );
};
