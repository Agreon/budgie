import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useToast } from '../ToastProvider';
import { useApi } from './use-request';

// eslint-disable-next-line no-shadow
export enum Query {
    Expenses = 'expenses',
    ReoccurringExpenses = 'reoccurring-expenses',
    Incomes = 'incomes',
    ReoccurringIncomes = 'reoccurring-incomes',
    Tags = 'tags',
    Reoccurring = 'reoccurring'
}

interface ListResult<T> {
  data: T[];
  number_of_entries: number;
}

export type QueryParams = Record<string, string | number | Date>;

// TODO: Error handling does not seem to work => No redirect
export function usePaginatedQuery<T>(
  query: Query,
  url: string,
  params?: QueryParams,
) {
  const api = useApi();
  const { showToast } = useToast();

  const { data: queryData, ...queryResult } = useInfiniteQuery<ListResult<T>, Error>(
    [query, params],
    async ({ pageParam }) => {
      const page = pageParam === undefined ? 0 : pageParam - 1;

      const { data } = await api.get<ListResult<T>>(
        url,
        { params: { page, ...params } },
      );

      return data;
    },
    {
      getNextPageParam: (_lastPage, pages) => (
        pages.flatMap(({ data }) => data).length < pages[0].number_of_entries
          ? pages.length + 1
          : undefined
      ),
      refetchOnWindowFocus: false,
      retry: false,
      onError: error => showToast({ status: 'danger', message: error.message || 'Unknown error' }),
    },
  );

  const allData = useMemo(
    () => queryData?.pages.flatMap(({ data }) => data),
    [queryData],
  );

  return {
    ...queryResult,
    data: allData,
  };
}
