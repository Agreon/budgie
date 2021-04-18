import {
  NavigationProp, RouteProp, useNavigation, useRoute,
} from '@react-navigation/native';
import {
  Button, Datepicker, Icon, Input,
} from '@ui-kitten/components';
import dayjs from 'dayjs';
import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { Keyboard, View } from 'react-native';
import { useQueryClient } from 'react-query';
import tailwind from 'tailwind-rn';
import { Query } from '../../hooks/use-paginated-query';
import { useApi } from '../../hooks/use-request';
import { useToast } from '../../ToastProvider';
import { ReoccurringHistoryItem } from '../../util/types';
import { LoadingIndicator } from '../LoadingIndicator';
import { PageWrapper } from '../PageWrapper';

interface EditReoccurringHistoryFormProps {
    historyItem: ReoccurringHistoryItem;
    onSubmit: (update: Pick<ReoccurringHistoryItem, 'costs' | 'start_date' | 'end_date'>) => Promise<void>;
  }

const EditReoccurringHistoryItemForm: FC<EditReoccurringHistoryFormProps> = (
  { historyItem, onSubmit },
) => {
  const [costs, setCosts] = useState(historyItem.costs);
  const [startDate, setStartDate] = useState<Date>(dayjs(historyItem.start_date).toDate());
  const [endDate, setEndDate] = useState<Date>(dayjs(historyItem.end_date).toDate());

  const [loading, setLoading] = useState(false);

  const onSave = useCallback(async () => {
    setLoading(true);
    try {
      await onSubmit({
        costs: costs.replace(/,/g, '.'),
        start_date: startDate,
        end_date: endDate || undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [loading, costs, startDate, endDate]);

  return (
    <View style={tailwind('mb-3')}>
      <Input
        style={tailwind('mt-1')}
        value={costs}
        onChangeText={setCosts}
        label="Cost"
        keyboardType="number-pad"
      />
      <Datepicker
        style={tailwind('mt-4')}
        label="Start date"
        date={startDate}
        onFocus={Keyboard.dismiss}
        onSelect={setStartDate}
        accessoryRight={props => (<Icon {...props} name="calendar" />)}
      />
      <Datepicker
        style={tailwind('mt-4')}
        label="End date"
        date={endDate}
        onFocus={Keyboard.dismiss}
        onSelect={setEndDate}
        accessoryRight={props => (<Icon {...props} name="calendar" />)}
      />
      <Button
        style={tailwind('mt-8')}
        disabled={loading}
        onPress={onSave}
        accessoryLeft={loading ? props => <LoadingIndicator {...props} /> : undefined}
      >
        Save
      </Button>
    </View>
  );
};

export const EditReoccurringHistoryItem: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const queryClient = useQueryClient();

  // These types are just for ts to don't annoy
  const { params: { id } } = useRoute<RouteProp<{key: { id: string }}, 'key'>>();

  const api = useApi();
  const { showToast } = useToast();

  const [historyItem, setHistoryItem] = useState<ReoccurringHistoryItem | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`recurring/${id}`);
        setHistoryItem(data.recurring);
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
    })();
  }, [id]);

  const onSave = useCallback(async (update: Pick<ReoccurringHistoryItem, 'costs' | 'start_date' | 'end_date'>) => {
    try {
      await api.put(`recurring/${id}`, {
        ...historyItem,
        ...update,
      });
      queryClient.resetQueries({ queryKey: Query.Reoccurring });
      navigation.goBack();
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, api, historyItem, navigation, showToast]);

  return (
    <PageWrapper
      title="Edit Reoccurring History"
      loading={!historyItem}
    >
      <EditReoccurringHistoryItemForm historyItem={historyItem!} onSubmit={onSave} />
    </PageWrapper>
  );
};
