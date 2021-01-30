import React, { FC, useCallback, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
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
  Spinner,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { RootStackParamList } from '../../App';

const BackIcon = (props: IconProps) => (
  <Icon {...props} name="arrow-back" />
);

const CalendarIcon = (props: IconProps) => (
  <Icon {...props} name="calendar" />
);

const types = [
  'Snäckies',
  'Futter',
  'Unterhosen',
];

const LoadingIndicator = (props: any) => (
  <View style={tailwind('justify-center items-center')} {...props}>
    <Spinner size="small" />
  </View>
);

/**
 * TODO:
 * - Abstände
 * - Required fields
 */
export const CreateExpense: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'CreateExpense'>
}> = ({ navigation }) => {
  const [costs, setCosts] = useState('0');
  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(0));
  const [name, setName] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date>(new Date());

  const [loading, setLoading] = useState(false);
  const createExpense = useCallback(async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/expense', {
        type: types[selectedIndex.row],
        costs,
        name,
        date,
      });

      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [costs, selectedIndex, name, date]);

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
  );

  return (
    <SafeAreaView style={tailwind('bg-white h-full w-full')}>
      <TopNavigation title="Create Expense" alignment="center" accessoryLeft={BackAction} />
      <View style={tailwind('flex pl-5 pr-5')}>
        <Input
          style={tailwind('mt-1')}
          value={costs}
          onChangeText={(text) => setCosts(text)}
          label="Cost"
          autoFocus
          keyboardType="decimal-pad"
        />
        <Select
          style={tailwind('mt-4')}
          label="Type"
          selectedIndex={selectedIndex}
          value={types[selectedIndex.row]}
          onSelect={(index) => setSelectedIndex(index as IndexPath)}
        >
          {
            types.map((type) => (
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
          autoFocus
        />
        <Button
          style={tailwind('mt-8')}
          disabled={loading}
          onPress={createExpense}
          accessoryLeft={loading ? LoadingIndicator : undefined}
        >
          Submit
        </Button>
      </View>
    </SafeAreaView>
  );
};
