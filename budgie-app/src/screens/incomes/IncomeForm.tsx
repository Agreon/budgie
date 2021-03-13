import React, {
  FC, useCallback, useState,
} from 'react';
import { Keyboard, View } from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Button,
  Datepicker,
  Icon,
  Input,
} from '@ui-kitten/components';
import dayjs from 'dayjs';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { Income } from '../../util/types';

interface IProps {
    income?: Income;
    onSubmit: (income: Omit<Income, 'id'>) => Promise<void>;
}

export const IncomeForm: FC<IProps> = ({
  income,
  onSubmit,
}) => {
  const [costs, setCosts] = useState(income?.costs || '');
  const [name, setName] = useState<string>(income?.name || '');
  const [date, setDate] = useState<Date>(income?.date ? dayjs(income.date).toDate() : new Date());

  const [loading, setLoading] = useState(false);

  const onSave = useCallback(async () => {
    setLoading(true);
    try {
      await onSubmit({
        costs: costs.replace(/,/g, '.'),
        name,
        date,
      });
    } finally {
      setLoading(false);
    }
  }, [loading, income, costs, name, date]);

  return (
    <View>
      <Input
        style={tailwind('mt-1')}
        value={costs}
        onChangeText={(text) => setCosts(text)}
        label="Amount"
        autoFocus={!income}
        keyboardType="decimal-pad"
      />
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
        label="Name"
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
