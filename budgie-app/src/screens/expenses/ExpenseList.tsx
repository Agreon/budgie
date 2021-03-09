import React, {
  FC, useEffect,
} from 'react';
import {
  SafeAreaView, FlatList, RefreshControl, View, TouchableWithoutFeedback,
} from 'react-native';

import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button, Icon, Text,
} from '@ui-kitten/components';
import * as SplashScreen from 'expo-splash-screen';
import { InfiniteData, useQueryClient } from 'react-query';
import { Header } from '../../components/Header';
import { Expense } from '../../util/types';
import { ExpensesStackParamList } from '.';
import { LOADING_INDICATOR_OFFSET } from '../../util/globals';
import { ItemDivider } from '../../components/ItemDivider';
import { ItemDate } from '../../components/ItemDate';
import { Query, usePaginatedQuery } from '../../hooks/use-paginated-query';

const ExpenseItem: FC<{
  item: Expense;
  onPress: (id: string) => void
}> = ({ item, onPress }) => (
  <TouchableWithoutFeedback delayPressIn={0} onPress={() => onPress(item.id)}>
    <View style={tailwind('p-2 flex-row justify-between')}>
      <View style={{
        ...tailwind('flex-col ml-1 pr-2'),
        flex: 2,
      }}
      >
        <Text category="h5" status="primary" style={tailwind('font-bold')}>{item.category}</Text>
        <View style={tailwind('flex-row items-center')}>
          <Text
            appearance="hint"
            numberOfLines={1}
            style={item.name ? tailwind('mr-2') : undefined}
          >
            {item.name}

          </Text>
          {item.tags![0] != null
            && (
              <Text
                style={{
                  ...tailwind('border rounded border-gray-300 p-1'),
                  marginTop: 2,
                }}
                category="c1"
              >
                {item.tags![0].name}
              </Text>
            )}
        </View>
      </View>
      <View style={tailwind('flex-col justify-between mr-1 flex-1')}>
        <ItemDate date={item.date} />
        <Text category="h6" style={tailwind('text-red-400 font-bold text-right')}>
          {item.costs}
          {' '}
          €
        </Text>
      </View>
    </View>
  </TouchableWithoutFeedback>
);

// TODO: Refresh-control is not directly loading
export const ExpenseList: FC<{
  navigation: StackNavigationProp<ExpensesStackParamList, 'Expenses'>
}> = ({ navigation }) => {
  const {
    data: expenses, isLoading, refetch, isFetching, fetchNextPage, hasNextPage,
  } = usePaginatedQuery<Expense>(Query.Expense);

  const queryClient = useQueryClient();

  console.log(expenses?.length);

  useEffect(() => {
    (async () => {
      await SplashScreen.hideAsync();
    })();
  }, []);

  console.log(isLoading, isFetching);

  return (
    <SafeAreaView
      style={tailwind('h-full w-full bg-white')}
    >
      <FlatList<Expense>
        style={tailwind('w-full')}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={() => <Header title="Expenses" />}
        ItemSeparatorComponent={ItemDivider}
        refreshControl={(
          <RefreshControl
            refreshing={isFetching}
            onRefresh={async () => {
              // TODO: Move into hook
              // Remove all pages > 1 to trigger a refetch that only gets one page
              queryClient.setQueryData<InfiniteData<Expense> | undefined>(Query.Expense, old => {
                if (old && old.pages.length) {
                  return {
                    ...old,
                    pages: [old.pages[0]],
                  };
                }

                return old;
              });
              await refetch();
            }}
            progressViewOffset={LOADING_INDICATOR_OFFSET}
          />
        )}
        renderItem={({ item }) => (
          <ExpenseItem
            item={item}
            onPress={id => { navigation.navigate('EditExpense', { id }); }}
          />
        )}
        data={expenses}
        keyExtractor={item => item.id}
        onEndReachedThreshold={0.2}
        onEndReached={({ distanceFromEnd }) => {
          // Would trigger a refetch on navigation change.
          if (distanceFromEnd < 0) return;

          console.log('The end is near!');
          if (hasNextPage) {
            console.log('Fetching');
            fetchNextPage();
          }
        }}
      />
      <Button
        style={tailwind('absolute right-6 bottom-5')}
        status="info"
        accessoryLeft={props => (
          <Icon {...props} name="plus-outline" />
        )}
        onPress={() => navigation.navigate('CreateExpense')}
      />
    </SafeAreaView>
  );
};
