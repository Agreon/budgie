import React, {
  FC, useCallback, useState,
} from 'react';
import { Keyboard, View } from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Button,
  Datepicker,
  Icon,
  IconProps,
  IndexPath,
  Input,
  Select,
  SelectItem,
} from '@ui-kitten/components';
import dayjs from 'dayjs';
import { LoadingIndicator } from './LoadingIndicator';
import { Expense } from '../util/types';

const CalendarIcon = (props: IconProps) => (
  <Icon {...props} name="calendar" />
);

const categories = [
  'Food',
  'Clothes',
  'DinnerOutside',
  'Rent',
  'Electricity',
  'GEZ',
  'Insurance',
  'Cellphone',
  'PublicTransport',
  'Internet',
  'HygieneMedicine',
  'LeisureTime',
  'Education',
  'Travel',
  'Other',
];

const getIndexOfCategory = (category: string) => {
  const index = categories.findIndex((c) => c === category);
  if (index < 0) {
    console.warn('Could not find index for category', category);
    return 0;
  }

  return index;
};

interface IProps {
    expense?: Expense;
    onSubmit: (expense: Omit<Expense, 'id'>) => Promise<void>;
}

export const ExpenseForm: FC<IProps> = ({ expense, onSubmit }) => {
  const [costs, setCosts] = useState(expense?.costs || '');
  const [selectedIndex, setSelectedIndex] = useState(
    new IndexPath(expense ? getIndexOfCategory(expense.category) : 0),
  );
  const [name, setName] = useState<string | undefined>(expense?.name);
  console.log(expense);
  const [date, setDate] = useState<Date>(expense?.date ? dayjs(expense.date).toDate() : new Date());

  const [loading, setLoading] = useState(false);
  console.log(costs);

  const onSave = useCallback(async () => {
    setLoading(true);
    try {
      await onSubmit({
        category: categories[selectedIndex.row],
        costs: costs.replace(/,/g, '.'),
        name,
        date,
      });
    } finally {
      setLoading(false);
    }
  }, [loading, expense, selectedIndex, costs, name, date]);

  return (
    <View>
      <Input
        style={tailwind('mt-1')}
        value={costs}
        onChangeText={(text) => setCosts(text)}
        label="Cost"
        autoFocus
        keyboardType="number-pad"
      />
      <Select
        style={tailwind('mt-4')}
        label="Type"
        selectedIndex={selectedIndex}
        value={categories[selectedIndex.row]}
        onSelect={(index) => setSelectedIndex(index as IndexPath)}
        onFocus={() => Keyboard.dismiss()}
      >
        {
          categories.map((type) => (
            <SelectItem key={type} title={type} />
          ))
        }
      </Select>
      <Datepicker
        style={tailwind('mt-4')}
        label="Date"
        date={date}
        onFocus={() => Keyboard.dismiss()}
        onSelect={(nextDate) => setDate(nextDate)}
        accessoryRight={CalendarIcon}
      />
      <Input
        style={tailwind('mt-4')}
        value={name}
        onChangeText={(text) => setName(text)}
        label="Name (Optional)"
        onSubmitEditing={onSave}
      />
      <Button
        style={tailwind('mt-8')}
        disabled={loading}
        onPress={onSave}
        accessoryLeft={loading ? LoadingIndicator : undefined}
      >
        Save
      </Button>
    </View>
  );
};
