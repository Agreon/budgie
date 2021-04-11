import React, {
  FC, useCallback, useState,
} from 'react';
import { Keyboard, View } from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Button,
  Datepicker,
  Icon,
  IndexPath,
  Input,
  Select,
  SelectItem,
} from '@ui-kitten/components';
import dayjs from 'dayjs';
import { LoadingIndicator } from '../LoadingIndicator';
import { Reoccurring } from '../../util/types';
import { CATEGORIES } from '../../util/globals';
import { getIndexOfCategory } from '../../util/util';

interface IProps {
  reoccurring?: Reoccurring;
  onSubmit: (expense: Omit<Reoccurring, 'id' | 'is_expense'>) => Promise<void>;
}

/**
 * TODO: Focus (https://stackoverflow.com/a/59754484)
 *  - returnKeyType='next'
 *
 * - Possibility to set endDate to null
 */
export const ReoccurringForm: FC<IProps> = ({
  reoccurring,
  onSubmit,
}) => {
  const [costs, setCosts] = useState(reoccurring?.costs || '');
  const [selectedCategory, setSelectedCategory] = useState(
    new IndexPath(reoccurring?.category ? getIndexOfCategory(reoccurring.category) : 0),
  );
  const [name, setName] = useState<string>(reoccurring?.name || '');
  const [startDate, setStartDate] = useState<Date>(
    reoccurring?.start_date ? dayjs(reoccurring.start_date).toDate() : new Date(),
  );
  const [endDate, setEndDate] = useState<Date | null>(
    reoccurring?.end_date ? dayjs(reoccurring.end_date).toDate() : null,
  );

  const [loading, setLoading] = useState(false);

  const onSave = useCallback(async () => {
    setLoading(true);
    try {
      await onSubmit({
        name,
        category: CATEGORIES[selectedCategory.row],
        costs: costs.replace(/,/g, '.'),
        start_date: startDate,
        end_date: endDate || undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [loading, reoccurring, selectedCategory, costs, name, startDate, endDate]);

  return (
    <View style={tailwind('mb-3')}>
      <Input
        style={tailwind('mt-4')}
        value={name}
        onChangeText={setName}
        label="Name"
        autoFocus={!reoccurring}
      />
      <Input
        style={tailwind('mt-1')}
        value={costs}
        onChangeText={setCosts}
        label="Cost"
        keyboardType="number-pad"
      />
      {reoccurring?.is_expense && (
        <Select
          style={tailwind('mt-4')}
          label="Type"
          selectedIndex={selectedCategory}
          value={CATEGORIES[selectedCategory.row]}
          onSelect={index => setSelectedCategory(index as IndexPath)}
          onFocus={Keyboard.dismiss}
        >
          {
            CATEGORIES.map(type => (
              <SelectItem key={type} title={type} />
            ))
          }
        </Select>
      )}
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
        label="End date (optional)"
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
