import React, {
  FC,
} from 'react';
import { View } from 'react-native';
import {
  Card,
  Icon,
  Text,
} from '@ui-kitten/components';
import tailwind from 'tailwind-rn';
import { HistoricValue, useOverviewContext } from './OverviewProvider';

const TrendArrow: FC<{
  value: HistoricValue
}> = ({ value: {current, previous} }) => {
  if (current === previous) {
    return <Icon fill="grey" style={{ width: 32, height: 32, padding: 1 }} name="minus" />;
  }

  if (current < previous) {
    return <Icon fill="#f4511e" style={{ width: 32, height: 32 }} name="arrow-down" />;
  }

  return <Icon fill="#8bc34a" style={{ width: 32, height: 32 }} name="arrow-up" />;
};

export const SavingsRateCard: FC = () => {
  const { previousEmpty, data: { totalExpense, totalIncome, amountSaved, savingsRate } } = useOverviewContext();

  return (
    <Card>
      <View style={tailwind('flex-row justify-between')}>
        <Text style={tailwind('font-bold text-xl')}>Savings Rate</Text>
        <View style={tailwind('flex-row')}>
          <Text style={tailwind('font-bold text-xl')}>
            {savingsRate.current > 0 ? savingsRate.current : 0}
            {' '}
            %
        </Text>
        {!previousEmpty &&  <TrendArrow value={savingsRate} />}
        </View>
      </View>
      <View style={tailwind('flex-row justify-between mt-3')}>
        <Text>Total Income</Text>
        <View>
          <Text>
            {totalIncome.current ?? 0}
            {' '}
            €
        </Text>
        </View>
      </View>
      <View style={tailwind('flex-row justify-between mt-3')}>
        <Text>Total Expenses</Text>
        <View>
          <Text>
            {totalExpense.current ?? 0}
            {' '}
            €
        </Text>
        </View>
      </View>
      <View style={tailwind('flex-row justify-between mt-3')}>
        <Text>Amount saved</Text>
        <View>
          <Text>
            {amountSaved ?? 0}
            {' '}
            €
        </Text>
        </View>
      </View>
    </Card>
  );
}