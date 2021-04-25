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
import { OverviewData } from '../../util/types';

/**
 * TODO:
 * dont show arrow on first month!
 */
export const SavingsRateCard: FC<{data: OverviewData, previous: OverviewData}> = (
  {
    data: {
      totalExpense, totalIncome, amountSaved, savingsRate,
    },
    previous: {
      savingsRate: previousSavingsRate,
    },
  },
) => (
  <Card>
    <View style={tailwind('flex-row justify-between')}>
      <Text style={tailwind('font-bold text-xl')}>Savings Rate</Text>
      <View style={tailwind('flex-row')}>
        <Text style={tailwind('font-bold text-xl')}>
          {parseFloat(savingsRate) > 0 ? savingsRate : 0}
          {' '}
          %
        </Text>
        <View>
          {parseFloat(previousSavingsRate) < parseFloat(savingsRate)
            ? <Icon fill="#8bc34a" style={{ width: 32, height: 32 }} name="arrow-up" />
            : <Icon fill="#f4511e" style={{ width: 32, height: 32 }} name="arrow-down" />}
        </View>
      </View>
    </View>
    <View style={tailwind('flex-row justify-between mt-3')}>
      <Text>Total Income</Text>
      <View>
        <Text>
          {totalIncome ?? 0}
          {' '}
          €
        </Text>
      </View>
    </View>
    <View style={tailwind('flex-row justify-between mt-3')}>
      <Text>Total Expenses</Text>
      <View>
        <Text>
          {totalExpense ?? 0}
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
