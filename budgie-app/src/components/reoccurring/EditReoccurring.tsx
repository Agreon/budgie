import React, {
  useCallback, useState,
} from 'react';
import {
  Keyboard,
} from 'react-native';
import {
  Icon,
  TopNavigationAction,
} from '@ui-kitten/components';
import {
  RouteProp, useNavigation, useRoute,
} from '@react-navigation/native';
import { useQuery } from 'react-query';
import { Reoccurring, ReoccurringHistoryItem } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { ReoccurringForm } from './ReoccurringForm';
import { capitalize } from '../../util/util';
import { ReoccurringHistory } from './ReoccurringHistory';
import { DeleteDialog } from '../DeleteDialog';
import { Query } from '../../hooks/use-paginated-query';
import { PageWrapper } from '../PageWrapper';

export const EditReoccurring = ({ type, onActionDone }: {
  type: 'expense' | 'income'
  onActionDone: () => void
}) => {
  const navigation = useNavigation();
  // These types are just for ts to don't annoy
  const { params: { id } } = useRoute<RouteProp<{key: { id: string }}, 'key'>>();

  const api = useApi();
  const { showToast } = useToast();

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const { data, refetch } = useQuery<{
    recurring: Reoccurring, history: ReoccurringHistoryItem[]}, Error
    >(
      [Query.Reoccurring, id],
      async () => {
        const response = await api.get(`recurring/${id}`);
        return response.data;
      }, {
        refetchOnWindowFocus: false,
        retry: false,
        onError: error => showToast({ status: 'danger', message: error.message || 'Unknown error' }),
      },
    );

  const onSave = useCallback(async (reoccurringData: Omit<Reoccurring, 'id' | 'is_expense'>) => {
    try {
      // If the costs changed we need to make a check
      if (reoccurringData.costs !== data?.recurring.costs) {
        // TODO: Check wether the old one should be modified instead.
        await api.post(`recurring-item/${id}`, {
          ...reoccurringData,
          // TODO: Set startDate to current EndDate? Should be done in backend?
          start_date: new Date(),
          type,
        });

        onActionDone();
        return;
      }

      await api.put(`recurring/${id}`, {
        ...reoccurringData,
        type,
      });
      onActionDone();
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, data, api, navigation, type, showToast, onActionDone]);

  return (
    <PageWrapper
      title={`Edit Reoccurring ${capitalize(type)}`}
      loading={!data}
      accessoryRight={props => (
        <TopNavigationAction
          {...props}
          icon={iconProps => (
            <Icon {...iconProps} name="trash-2-outline" />
          )}
          onPress={() => {
            Keyboard.dismiss();
            setDeleteDialogVisible(true);
          }}
        />
      )}
    >
      <ReoccurringForm
        reoccurring={data!.recurring}
        forType={type}
        onSubmit={onSave}
      />
      {data!.history.length !== 0 && (
      <ReoccurringHistory
        history={data!.history}
        refresh={async () => { await refetch(); }}
      />
      )}
      <DeleteDialog
        deletePath={`recurring/${id}`}
        visible={deleteDialogVisible}
        content={`Are you sure you want to delete this reoccurring ${type}?`}
        onClose={() => setDeleteDialogVisible(false)}
        onDeleted={onActionDone}
      />
    </PageWrapper>
  );
};
