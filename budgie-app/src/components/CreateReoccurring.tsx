import React, {
  useCallback,
} from 'react';
import { View, ScrollView } from 'react-native';
import tailwind from 'tailwind-rn';
import { QueryClient, useQueryClient } from 'react-query';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { Header } from './Header';
import { BackAction } from './BackAction';
import { Reoccurring } from '../util/types';
import { useToast } from '../ToastProvider';
import { useApi } from '../hooks/use-request';
import { ReoccurringForm } from './ReoccurringForm';

export const CreateReoccurring = <
  N extends ParamListBase
>({ type, onActionDone }: {
  type: 'expense' | 'income',
  onActionDone: (queryClient: QueryClient, navigation: NavigationProp<N>) => void
}) => {
  const navigation = useNavigation<NavigationProp<N>>();
  const api = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const createReoccurring = useCallback(async (reoccurringData: Omit<Reoccurring, 'id' | 'is_expense'>) => {
    try {
      await api.post('recurring', {
        ...reoccurringData,
        type,
      });
      onActionDone(queryClient, navigation);
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [api, navigation, showToast, type, onActionDone]);

  // TODO: Maybe extract this ScrollView + Header stuff
  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      style={tailwind('bg-white h-full w-full')}
    >
      <Header
        // TODO: Uppercase
        title={`Create Reoccurring ${type}`}
        accessoryLeft={() => <BackAction navigation={navigation} />}
      />
      <View style={tailwind('flex pl-5 pr-5')}>
        <ReoccurringForm
          onSubmit={createReoccurring}
        />
      </View>
    </ScrollView>
  );
};
