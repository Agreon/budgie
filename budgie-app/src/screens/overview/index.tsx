import React, {
  FC,
} from 'react';
import {
  Card,
  Spinner,
  Text,
} from '@ui-kitten/components';
import {
  ScrollView, View,
} from 'react-native';
import tailwind from 'tailwind-rn';
import { SavingsRateCard } from './SavingsRateCard';
import { CategoryPieChart } from './CategoryPieChart';
import { MonthSwitcher } from './MonthSwitcher';
import { OverviewList } from './OverviewList';
import { OverviewContext, OverviewProvider } from './OverviewProvider';
import { DataFilterSelection } from './DataFilterSelection';

/**
   * TODO:
   *  - Switch to all time view?
   *  => Vlt auf einer ebene mit DataFitler-selection?
   *  - Swipe control?
   * Refetch on every page-change?
*/
export const Overview: FC = () => (
  <OverviewProvider>
    <OverviewContext.Consumer>
      {({ loading, data: { expensesByCategory, expensesByTag }, previousEmpty }) => (
        <ScrollView
          stickyHeaderIndices={[0]}
          style={tailwind('bg-white h-full')}
          contentContainerStyle={loading ? tailwind('h-full') : undefined}
        >
          <MonthSwitcher />
          {loading && (
            <View
              style={tailwind('absolute w-full h-full flex items-center bg-gray-100 bg-opacity-50 justify-center z-10')}
            >
              <Spinner size="giant" />
            </View>
          )}
          <View style={tailwind('p-2')}>
            <SavingsRateCard />
            <Card>
              <View style={tailwind('flex-row items-center justify-between')}>
                <Text style={tailwind('font-bold text-xl')}>Categories</Text>
                <DataFilterSelection />
              </View>
              <CategoryPieChart />
              <OverviewList items={expensesByCategory} showTrend={!previousEmpty} />
            </Card>
            <Card>
              <Text style={tailwind('font-bold text-xl')}>Tags</Text>
              <OverviewList items={expensesByTag} showTrend={!previousEmpty} />
            </Card>
          </View>
        </ScrollView>
      )}
    </OverviewContext.Consumer>
  </OverviewProvider>
);
