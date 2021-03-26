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
  Spinner, TopNavigationAction,
} from '@ui-kitten/components';
import {
  NavigationProp,
  ParamListBase, RouteProp, useNavigation, useRoute,
} from '@react-navigation/native';
import { QueryClient, useQueryClient } from 'react-query';
import { BackAction } from './BackAction';
import { Header } from './Header';
import { Reoccurring } from '../util/types';
import { useToast } from '../ToastProvider';
import { Dialog } from './Dialog';
import { useApi } from '../hooks/use-request';
import { ReoccurringForm } from './ReoccurringForm';

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
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { recurring } } = await api.get(`recurring/${id}`);
        setReoccurring(recurring);
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
    })();
  }, [id, setReoccurring, showToast]);

  const onSave = useCallback(async (reoccurringData: Omit<Reoccurring, 'id' | 'is_expense'>) => {
    try {
      await api.put(`recurring/${id}`, {
        ...reoccurringData,
        type,
      });
      onActionDone(queryClient, navigation);
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, api, navigation, type, showToast, onActionDone]);

  const onDelete = useCallback(async () => {
    // TODO: Some kind of loading state would be nice.
    setDeleteDialogVisible(false);
    try {
      await api.delete(`recurring/${id}`);
      onActionDone(queryClient, navigation);
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, api, navigation, showToast, onActionDone, setDeleteDialogVisible]);

  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      style={tailwind('bg-white h-full w-full')}
    >
      <Header
        // TODO: Uppercase
        title={`Edit Reoccurring ${type}`}
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
        !reoccurring ? (
          <View style={tailwind('absolute w-full h-full flex items-center bg-gray-300 bg-opacity-25 justify-center z-10')}>
            <Spinner size="giant" />
          </View>
        ) : (
          <View style={tailwind('flex pl-5 pr-5')}>
            <ReoccurringForm
              reoccurring={reoccurring}
              onSubmit={onSave}
            />
            <Dialog
              visible={deleteDialogVisible}
              content={`Are you sure you want to delete this reoccurring ${type}?`}
              onClose={() => setDeleteDialogVisible(false)}
              onSubmit={onDelete}
            />
          </View>
        )
      }
    </ScrollView>
  );
};
