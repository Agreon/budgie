import {
  RouteProp,
} from '@react-navigation/native';
import { Card, Text } from '@ui-kitten/components';
import React, { FC } from 'react';
import { View } from 'react-native';
import tailwind from 'tailwind-rn';
import { OverviewStackParamList } from '.';
import { ItemDate } from '../../components/ItemDate';
import { List } from '../../components/List';
import { PageWrapper } from '../../components/PageWrapper';
import { Query } from '../../hooks/use-paginated-query';
import { Expense, Reoccurring } from '../../util/types';
import { ReoccurringExpenseItem } from '../expenses/ReoccurringExpenseList';

/**
 * - Do we want to use the list component here?
 *  => Maybe just use usePaginatedQuery for expenses, tags and reoccurring
 *         to have one combined loading state!
 *
 * TODO: Show tags if existent
 *
 * TODO: Only show cards if there are any expenses
 *
 * TODO: Maybe also show detailed spendings with trend?
 *
 * TODO: Use cutom list-items => {name} {amount} {date}
 *
// TODO: create tag component
 *
 */
export const CategoryOverview: FC<{
    route: RouteProp<OverviewStackParamList, 'CategoryOverview'>
}> = ({ route: { params: { category, startDate, endDate } } }) => (
  <PageWrapper
    title={`${category} - ${startDate.format('MMMM YYYY')}`}
    contentContainerStyle={tailwind('flex p-2')}
  >
    <Card>
      <Text style={tailwind('font-bold text-xl')}>Reoccurring Expenses</Text>
      <List<Reoccurring>
        query={Query.Reoccurring}
        params={{
          type: 'expense',
          category,
          startDate: startDate.toDate(),
          endDate: endDate.toDate(),
        }}
        url="recurring"
        renderItem={({ item }) => (
          <ReoccurringExpenseItem
            item={item}
          />
        )}
      />
    </Card>
    <Card>
      <Text style={tailwind('font-bold text-xl')}>Expenses</Text>
      <List<Expense>
        query={Query.Expenses}
        params={{
          category,
          startDate: startDate.toDate(),
          endDate: endDate.toDate(),
        }}
        url="expense"
        renderItem={({
          item: {
            name, costs, date, tags,
          },
        }) => (
          <View style={tailwind('flex flex-row justify-between items-center pt-2 pb-2')}>
            <View style={tailwind('flex')}>
              <Text>{name || 'No name given'}</Text>
              {tags![0] != null
                && (
                <Text
                  style={{
                    ...tailwind('border rounded border-gray-300 p-1'),
                    marginTop: 2,
                  }}
                  category="c1"
                >
                    {tags![0].name}
                </Text>
            )}
            </View>
            <View style={tailwind('flex justify-between mr-1')}>
              <ItemDate date={date} />
              <Text>
                {costs}
                €
              </Text>
            </View>
          </View>
        )}
      />
    </Card>
  </PageWrapper>
);
