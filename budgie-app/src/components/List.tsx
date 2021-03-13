import React from 'react';
import { FlatList, ListRenderItem, RefreshControl } from 'react-native';
import { InfiniteData, useQueryClient } from 'react-query';
import tailwind from 'tailwind-rn';
import { Query, usePaginatedQuery } from '../hooks/use-paginated-query';
import { LOADING_INDICATOR_OFFSET } from '../util/globals';
import { Header } from './Header';
import { ItemDivider } from './ItemDivider';

export interface ListProps<T> {
    query: Query;
    title: string;
    renderItem: ListRenderItem<T>;
}

// TODO: Refresh-control is not directly loading
export function List<T extends {id: string}>({ query, title, renderItem }: ListProps<T>) {
  const {
    data: expenses, isLoading, refetch, isFetching, fetchNextPage, hasNextPage,
  } = usePaginatedQuery<T>(query);

  const queryClient = useQueryClient();

  return (
    <FlatList<T>
      style={tailwind('w-full')}
      stickyHeaderIndices={[0]}
      ListHeaderComponent={() => <Header title={title} />}
      ItemSeparatorComponent={ItemDivider}
      refreshControl={(
        <RefreshControl
          refreshing={isLoading || isFetching}
          onRefresh={async () => {
            // Remove all pages > 1 to trigger a refetch that only gets one page
            queryClient.setQueryData<InfiniteData<T> | undefined>(query, old => {
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
      renderItem={renderItem}
      data={expenses}
      keyExtractor={item => item.id}
      onEndReachedThreshold={0.4}
      onEndReached={({ distanceFromEnd }) => {
        // Would trigger a refetch on navigation change.
        if (distanceFromEnd < 0) return;

        if (hasNextPage) {
          fetchNextPage();
        }
      }}
    />
  );
}
