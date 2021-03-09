import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useToast } from '../ToastProvider';
import { useApi } from './use-request';

// eslint-disable-next-line no-shadow
export enum Query {
    Expense = 'expense'
  }

export function usePaginatedQuery<T>(query: Query) {
  const api = useApi();
  const { showToast } = useToast();

  const { data: queryData, ...queryResult } = useInfiniteQuery<T[], Error>(
    [query], async ({ pageParam }) => {
      const page = pageParam === undefined ? 0 : pageParam - 1;
      const { data } = await api.get(`${query}?page=${page}`);

      console.log('Done');
      // TODO: Backend should always deliver an array
      return data || [];
    }, {
      getNextPageParam: (_lastPage, pages) => (
        pages[pages.length - 1].length !== 0
          ? pages.length + 1
          : undefined
      ),
      refetchOnWindowFocus: false,
      retry: false,
      // TODO: Also do navigation-redirect here?
      onError: error => showToast({ status: 'danger', message: error.message || 'Unknown error' }),
    },
  );

  const allData = useMemo(
    () => queryData?.pages.flatMap(data => data),
    [queryData],
  );

  return {
    ...queryResult,
    data: allData,
  };
}
