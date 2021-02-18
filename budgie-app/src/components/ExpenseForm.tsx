import React, {
  FC, useCallback, useState,
} from 'react';
import { View } from 'react-native';
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
import { TagSelection } from './TagSelection';

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
  const [date, setDate] = useState<Date>(expense?.date ? dayjs(expense.date).toDate() : new Date());

  // TODO: Get this from outside components
  const availableTags = [
    { name: 'Rewe', id: '1' },
    { name: 'DB', id: '2' },
    { name: 'Test', id: '3' },
  ];
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const [loading, setLoading] = useState(false);

  const onSave = useCallback(async () => {
    setLoading(true);
    try {
      await onSubmit({
        category: categories[selectedIndex.row],
        costs,
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
        autoFocus={!expense}
        keyboardType="decimal-pad"
      />
      <Select
        style={tailwind('mt-4')}
        label="Type"
        selectedIndex={selectedIndex}
        value={categories[selectedIndex.row]}
        onSelect={(index) => setSelectedIndex(index as IndexPath)}
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
        onSelect={(nextDate) => setDate(nextDate)}
        accessoryRight={CalendarIcon}
      />
      <Input
        style={tailwind('mt-4')}
        value={name}
        onChangeText={(text) => setName(text)}
        label="Name"
        caption="Optional"
        onSubmitEditing={onSave}
      />
      <TagSelection
        available={availableTags}
        selected={selectedTags}
        onToggle={tagId => (
          selectedTags.find(s => s.id === tagId)
            ? setSelectedTags(prevSelected => prevSelected.filter(s => s.id !== tagId))
            : setSelectedTags(
              prevSelected => [...prevSelected, availableTags.find(s => s.id === tagId)!],
            )
        )}
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
