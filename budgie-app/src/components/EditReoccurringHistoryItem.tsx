import {
  NavigationProp, RouteProp, useNavigation, useRoute,
} from '@react-navigation/native';
import {
  Button, Datepicker, Icon, Input, Spinner,
} from '@ui-kitten/components';
import dayjs from 'dayjs';
import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import tailwind from 'tailwind-rn';
import { useApi } from '../hooks/use-request';
import { useToast } from '../ToastProvider';
import { ReoccurringHistoryItem } from '../util/types';
import { BackAction } from './BackAction';
import { Header } from './Header';
import { LoadingIndicator } from './LoadingIndicator';

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
      // TODO: Maybe we need a reload here?
      navigation.goBack();
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, api, historyItem, navigation, showToast]);

  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      style={tailwind('bg-white h-full w-full')}
    >
      <Header
        title="Edit Reoccurring History"
        accessoryLeft={() => <BackAction navigation={navigation} />}
      />
      {
        historyItem === null ? (
          <View style={tailwind('absolute w-full h-full flex items-center bg-gray-300 bg-opacity-25 justify-center z-10')}>
            <Spinner size="giant" />
          </View>
        ) : (
          <View style={tailwind('flex pl-5 pr-5')}>
            <EditReoccurringHistoryItemForm historyItem={historyItem} onSubmit={onSave} />
          </View>
        )
      }
    </ScrollView>
  );
};
