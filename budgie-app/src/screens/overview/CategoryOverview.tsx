import {
  RouteProp,
} from '@react-navigation/native';
import { Card, Icon, Text } from '@ui-kitten/components';
import dayjs from 'dayjs';
import React, { FC } from 'react';
import { View } from 'react-native';
import tailwind from 'tailwind-rn';
import { OverviewStackParamList } from '.';
import { ItemDate } from '../../components/ItemDate';
import { List } from '../../components/List';
import { PageWrapper } from '../../components/PageWrapper';
import { TagBox } from '../../components/TagBox';
import { Query } from '../../hooks/use-paginated-query';
import { Expense, Reoccurring } from '../../util/types';
import { ReoccurringExpenseItem } from '../expenses/ReoccurringExpenseList';

/**
 * - Do we want to use the list component here?
 *  => Maybe just use usePaginatedQuery for expenses, tags and reoccurring
 *         to have one combined loading state!
 *
 * TODO: Only show cards if there are any expenses / reouccrring expenses
 */
export const CategoryOverview: FC<{
    route: RouteProp<OverviewStackParamList, 'CategoryOverview'>
}> = ({ route: { params: { category, startDate, endDate } } }) => (
  <PageWrapper
    title={`${category} - ${dayjs(startDate).format('MMMM YYYY')}`}
    contentContainerStyle={tailwind('flex p-2')}
  >
    <Card>
      <Text style={tailwind('font-bold text-xl')}>Reoccurring Expenses</Text>
      <List<Reoccurring>
        query={Query.Reoccurring}
        params={{
          type: 'expense',
          category,
          startDate,
          endDate,
        }}
        url="recurring"
        renderItem={({ item }) => (
          <ReoccurringExpenseItem
            item={item}
            containerStyle={tailwind('flex-row justify-between pt-2 pb-2')}
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
          startDate,
          endDate,
        }}
        url="expense"
        renderItem={({
          item: {
            name, costs, date, tags,
          },
        }) => (
          <View style={tailwind('flex flex-row justify-between items-center pt-2 pb-2')}>
            <View style={tailwind('flex-row items-center')}>
              {name ? <Text>{name}</Text> : (
                <Icon fill="grey" style={{ width: 24, height: 24, padding: 1 }} name="minus" />

              )}
              {tags[0] != null
                && (
                  <View style={tailwind('ml-2 mt-1')}>
                    <TagBox tag={tags[0]} />
                  </View>
                )}
            </View>
            <View style={tailwind('flex justify-between mr-1')}>
              <ItemDate date={date} />
              <Text style={tailwind('text-red-400 font-bold text-right')}>
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
