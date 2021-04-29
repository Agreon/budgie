import React, {
  FC, useCallback, useEffect, useState,
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
import dayjs from 'dayjs';
import { useApi } from '../hooks/use-request';
import { useToast } from '../ToastProvider';
import { OverviewData } from '../util/types';
import { SavingsRateCard } from './overview/SavingsRateCard';
import { CategoryPieChart } from './overview/CategoryPieChart';
import { MonthSwitcher } from './overview/MonthSwitcher';
import { OverviewList } from './overview/OverviewList';

const useOverviewData = () => {
  const api = useApi();
  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{current: OverviewData, previous: OverviewData} | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = dayjs(selectedDate).startOf('month');
      const endDate = dayjs(selectedDate).endOf('month');

      const startDatePrevious = dayjs(selectedDate).subtract(1, 'month').startOf('month');
      const endDatePrevious = dayjs(selectedDate).subtract(1, 'month').endOf('month');

      const [{ data: current }, { data: previous }] = await Promise.all([
        api.get(`overview?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`overview?startDate=${startDatePrevious.toISOString()}&endDate=${endDatePrevious.toISOString()}`),
      ]);

      setData({
        current,
        previous,
      });
    } catch (err) {
      console.error(err);

      showToast({ message: 'Fetch failed', status: 'danger' });
    }
    setLoading(false);
  }, [api, selectedDate, setLoading, showToast]);

  useEffect(() => { (async () => fetchData())(); }, [selectedDate]);

  return {
    loading,
    data,
    selectedDate,
    setSelectedDate,
    fetchData,
  };
};

/**
 * Relative to all / non-reoccurring
 *  => setting as toggle?! (accessoryRight? or in cards?) oder als dropdown?
    - Ausgabe insgesamt
    - Ausgabe reoccurring
    - Ausgaben once
    -> Persistieren im local storage
    => OverflowMenu

 * TODO:
 *  - Switch to all time view?
 *  - Swipe control?
 */
export const Overview: FC = () => {
  // TODO: Refetch is not done if someone changed an entry somewhere else!
  const {
    data, loading, selectedDate, setSelectedDate,
  } = useOverviewData();

  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      style={tailwind('bg-white h-full')}
      contentContainerStyle={loading ? tailwind('h-full') : undefined}
    >
      <MonthSwitcher
        setSelectedDate={setSelectedDate}
        selectedDate={selectedDate}
        disablePreviousMonth={data?.previous.totalExpense === '0.00' && data?.previous.totalIncome === '0.00'}
      />
      {loading && (
        <View style={tailwind('absolute w-full h-full flex items-center bg-gray-100 bg-opacity-50 justify-center z-10')}>
          <Spinner size="giant" />
        </View>
      )}
      {data && (
        <View style={tailwind('p-2')}>
          <SavingsRateCard data={data.current} previous={data.previous} />
          <Card>
            <Text style={tailwind('font-bold text-xl')}>Categories</Text>
            <CategoryPieChart data={data.current} />
            <OverviewList
              data={data.current.expenseByCategory.map(e => ({
                title: e.category,
                totalCosts: e.totalCosts,
                percentage: e.percentageOfAllExpenses,
              }))}
              previous={data.previous.expenseByCategory.map(e => ({
                title: e.category,
                totalCosts: e.totalCosts,
                percentage: e.percentageOfAllExpenses,
              }))}
            />
          </Card>
          <Card>
            <Text style={tailwind('font-bold text-xl')}>Tags</Text>
            <OverviewList
              data={data.current.expenseByTag.map(e => ({
                title: e.tag,
                totalCosts: e.totalCosts,
                percentage: e.percentageOfAllExpenses,
              }))}
              previous={data.previous.expenseByTag.map(e => ({
                title: e.tag,
                totalCosts: e.totalCosts,
                percentage: e.percentageOfAllExpenses,
              }))}
            />
          </Card>
        </View>
      )}
    </ScrollView>
  );
};
