import React, {
  useCallback, useEffect, useState,
} from 'react';
import {
  Keyboard, ScrollView, View,
} from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Icon,
  IconProps,
  Spinner,
  TopNavigationAction,
} from '@ui-kitten/components';
import {
  NavigationProp,
  ParamListBase, RouteProp, useNavigation, useRoute,
} from '@react-navigation/native';
import { QueryClient, useQueryClient } from 'react-query';
import { BackAction } from './BackAction';
import { Header } from './Header';
import { Reoccurring, ReoccurringHistoryItem } from '../util/types';
import { useToast } from '../ToastProvider';
import { useApi } from '../hooks/use-request';
import { ReoccurringForm } from './ReoccurringForm';
import { capitalize } from '../util/util';
import { ReoccurringHistory } from './ReoccurringHistory';
import { DeleteDialog } from './DeleteDialog';

export const EditReoccurring = <
  N extends ParamListBase,
>({ type, onActionDone }: {
  type: 'expense' | 'income'
  onActionDone: (queryClient: QueryClient, navigation: NavigationProp<N>) => void
}) => {
  const navigation = useNavigation<NavigationProp<N>>();
  // These types are just for ts to don't annoy
  const { params: { id } } = useRoute<RouteProp<{key: { id: string }}, 'key'>>();

  const api = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [reoccurring, setReoccurring] = useState<Reoccurring | null>(null);
  const [history, setHistory] = useState<ReoccurringHistoryItem[] | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // TODO: use react-query?
  const loadData = useCallback(async () => {
    try {
      const { data } = await api.get(`recurring/${id}`);
      setReoccurring(data.recurring);
      setHistory(data.history);
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, api, setReoccurring, setHistory, showToast]);

  useEffect(() => {
    (async () => loadData())();
  }, [id]);

  const onSave = useCallback(async (reoccurringData: Omit<Reoccurring, 'id' | 'is_expense'>) => {
    try {
      // If the costs changed we need to make a check
      if (reoccurringData.costs !== reoccurring?.costs) {
        // TODO: Check wether the old one should be modified instead.
        await api.post(`recurring-item/${id}`, {
          ...reoccurringData,
          // TODO: Set startDate to current EndDate? Should be done in backend?
          start_date: new Date(),
          type,
        });

        onActionDone(queryClient, navigation);
        return;
      }

      await api.put(`recurring/${id}`, {
        ...reoccurringData,
        type,
      });
      onActionDone(queryClient, navigation);
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, api, navigation, type, showToast, onActionDone]);

  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      style={tailwind('bg-white h-full w-full')}
    >
      <Header
        title={`Edit Reoccurring ${capitalize(type)}`}
        accessoryLeft={() => <BackAction navigation={navigation} />}
        accessoryRight={() => (
          <TopNavigationAction
            icon={(props: IconProps) => (
              <Icon {...props} name="trash-2-outline" />
            )}
            onPress={() => {
              Keyboard.dismiss();
              setDeleteDialogVisible(true);
            }}
          />
        )}
      />
      {
        reoccurring === null || history === null ? (
          <View style={tailwind('absolute w-full h-full flex items-center bg-gray-300 bg-opacity-25 justify-center z-10')}>
            <Spinner size="giant" />
          </View>
        ) : (
          <View style={tailwind('flex pl-5 pr-5')}>
            <ReoccurringForm
              reoccurring={reoccurring}
              onSubmit={onSave}
            />
            <ReoccurringHistory history={history} refresh={loadData} />
            <DeleteDialog
              deletePath={`recurring/${id}`}
              visible={deleteDialogVisible}
              content={`Are you sure you want to delete this reoccurring ${type}?`}
              onClose={() => setDeleteDialogVisible(false)}
              onDeleted={() => onActionDone(queryClient, navigation)}
            />
          </View>
        )
      }
    </ScrollView>
  );
};
