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
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { Expense, Tag } from '../../util/types';
import { TagSelection } from './TagSelection';

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
  availableTags: Tag[];
  setAvailableTags: (tags: Tag[]) => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => Promise<void>;
}

export const ExpenseForm: FC<IProps> = ({
  expense,
  availableTags,
  setAvailableTags,
  onSubmit,
}) => {
  const [costs, setCosts] = useState(expense?.costs || '');
  const [selectedIndex, setSelectedIndex] = useState(
    new IndexPath(expense ? getIndexOfCategory(expense.category) : 0),
  );
  const [name, setName] = useState<string | undefined>(expense?.name);
  const [date, setDate] = useState<Date>(expense?.date ? dayjs(expense.date).toDate() : new Date());

  const [selectedTags, setSelectedTags] = useState<Tag[]>(expense?.tags || []);

  const [loading, setLoading] = useState(false);

  const onSave = useCallback(async () => {
    setLoading(true);
    try {
      await onSubmit({
        category: categories[selectedIndex.row],
        costs: costs.replace(/,/g, '.'),
        name,
        date,
        tags: selectedTags,
      });
    } finally {
      setLoading(false);
    }
  }, [loading, expense, selectedIndex, costs, name, date, selectedTags]);

  const onTagCreated = useCallback((tag: Tag) => {
    setAvailableTags([...availableTags].concat(tag));
    setSelectedTags([...selectedTags].concat(tag));
  }, [availableTags, setAvailableTags, selectedTags, setSelectedTags]);

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
        accessoryRight={props => (<Icon {...props} name="calendar" />)}
      />
      <Input
        style={tailwind('mt-4')}
        value={name}
        onChangeText={(text) => setName(text)}
        label="Name (optional)"
        onSubmitEditing={onSave}
      />
      <TagSelection
        available={availableTags}
        selected={selectedTags}
        onSelectionChanged={selected => setSelectedTags(selected)}
        onTagCreated={onTagCreated}
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
