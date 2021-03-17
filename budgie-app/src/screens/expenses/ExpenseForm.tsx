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
import { CATEGORIES } from '../../util/globals';
import { getIndexOfCategory } from '../../util/util';

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
  const [selectedCategory, setSelectedCategory] = useState(
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
        category: CATEGORIES[selectedCategory.row],
        costs: costs.replace(/,/g, '.'),
        name,
        date,
        tags: selectedTags,
      });
    } finally {
      setLoading(false);
    }
  }, [loading, expense, selectedCategory, costs, name, date, selectedTags]);

  const onTagCreated = useCallback((tag: Tag) => {
    setAvailableTags([...availableTags].concat(tag));
    setSelectedTags([...selectedTags].concat(tag));
  }, [availableTags, setAvailableTags, selectedTags, setSelectedTags]);

  return (
    <View style={tailwind('mb-3')}>
      <Input
        style={tailwind('mt-1')}
        value={costs}
        onChangeText={setCosts}
        label="Cost"
        autoFocus={!expense}
        keyboardType="number-pad"
      />
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
      <Datepicker
        style={tailwind('mt-4')}
        label="Date"
        date={date}
        onFocus={Keyboard.dismiss}
        onSelect={setDate}
        accessoryRight={props => (<Icon {...props} name="calendar" />)}
      />
      <Input
        style={tailwind('mt-4')}
        value={name}
        onChangeText={setName}
        label="Name (optional)"
        onSubmitEditing={onSave}
      />
      <TagSelection
        available={availableTags}
        selected={selectedTags}
        onSelectionChanged={setSelectedTags}
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
