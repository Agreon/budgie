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
  TopNavigationAction,
} from '@ui-kitten/components';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { RootStackParamList } from '../../App';
import { Header } from '../components/Header';

const BackIcon = (props: IconProps) => (
  <Icon {...props} name="arrow-back" />
);

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

const LoadingIndicator = (props: any) => (
  <View style={tailwind('justify-center items-center')} {...props}>
    <Spinner size="small" />
  </View>
);

/**
 * TODO:
 * - Required fields
 */
export const CreateExpense: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'CreateExpense'>
}> = ({ navigation }) => {
  const [cost, setCost] = useState('0');
  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(0));
  const [name, setName] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date>(new Date());

  const [loading, setLoading] = useState(false);
  const createExpense = useCallback(async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/expense', {
        category: categories[selectedIndex.row],
        cost,
        name,
        date,
      });

      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [cost, selectedIndex, name, date, navigation]);

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
  );

  return (
    <SafeAreaView style={tailwind('bg-white h-full w-full')}>
      <Header title="Create Expense" accessoryLeft={BackAction} />
      <View style={tailwind('flex pl-5 pr-5')}>
        <Input
          style={tailwind('mt-1')}
          value={cost}
          onChangeText={(text) => setCost(text)}
          label="Cost"
          autoFocus
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
