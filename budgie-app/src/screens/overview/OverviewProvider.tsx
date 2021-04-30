import dayjs, { Dayjs } from 'dayjs';
import React, {
  FC, useCallback, useEffect, useMemo, useState,
} from 'react';
import { useApi } from '../../hooks/use-request';
import { useToast } from '../../ToastProvider';
import { OverviewResponse } from '../../util/types';

export interface ExpenseGroupItem {
  name: string;
  percentage: number;
  totalCosts: number;
  previousCosts: number;
}

export interface HistoricValue {
  current: number;
  previous: number;
}

export interface OverviewData {
  totalExpense: HistoricValue;
  totalIncome: HistoricValue;
  savingsRate: HistoricValue;
  amountSaved: number;
  expensesByCategory: ExpenseGroupItem[];
  expensesByTag: ExpenseGroupItem[];
}

export type DateRange = [Dayjs, Dayjs];

export type DataFilter = "all" | "reoccurring" | "single";

interface OverviewCtx {
  data: OverviewData;
  loading: boolean;
  dataFilter: DataFilter;
  setDataFilter: (filter: DataFilter) => void;
  previousEmpty: boolean;
  selectedDateRange: DateRange;
  setSelectedDateRange: (dateRange: DateRange) => void;
}

const defaultContextData: OverviewData = {
  totalExpense: {
    current: 0,
    previous: 0
  },
  totalIncome: {
    current: 0,
    previous: 0
  },
  savingsRate: {
    current: 0,
    previous: 0
  },
  amountSaved: 0,
  expensesByCategory: [],
  expensesByTag: [],
}

export const OverviewContext = React.createContext<OverviewCtx>({
  data: defaultContextData,
  loading: false,
  previousEmpty: true,
  dataFilter: "all",
  setDataFilter: () => {},
  selectedDateRange: [dayjs().startOf("month"), dayjs().endOf("month")],
  setSelectedDateRange: () => {}
});

export const useOverviewContext = () => React.useContext(OverviewContext);

export const OverviewProvider: FC = ({ children }) => {
  const api = useApi();
  const { showToast } = useToast();

  const [dataFilter, setDataFilter] = useState<DataFilter>("single");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>([dayjs().startOf("month"), dayjs().endOf("month")]);
  const [response, setResponse] = useState<{ current: OverviewResponse, previous: OverviewResponse } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const startDatePrevious = selectedDateRange[0].subtract(1, 'month').startOf('month');
      const endDatePrevious = selectedDateRange[1].subtract(1, 'month').endOf('month');

      const [{ data: current }, { data: previous }] = await Promise.all([
        api.get(`overview?startDate=${selectedDateRange[0].toISOString()}&endDate=${selectedDateRange[1].toISOString()}`),
        api.get(`overview?startDate=${startDatePrevious.toISOString()}&endDate=${endDatePrevious.toISOString()}`),
      ]);

      setResponse({
        current,
        previous,
      });
    } catch (err) {
      console.error(err);

      showToast({ message: 'Fetch failed', status: 'danger' });
    }
    setLoading(false);
  }, [api, selectedDateRange, setLoading, showToast]);

  useEffect(() => { (async () => fetchData())(); }, [selectedDateRange]);

  const data: OverviewData = useMemo(() => {
    if (!response) {
      return defaultContextData;
    }
    const { current, previous } = response;

    const categoryListToUse = (dataFilter === "all"
      ? "expenseByCategory"
      : dataFilter === "single"
        ? "expenseOnceByCategory"
        : "expenseRecurringByCategory"
    );

    const currentCategoryList = current[categoryListToUse];
    const previousCategoryList = previous[categoryListToUse];

    const expensesByCategory = currentCategoryList.map(({category, totalCosts, percentageOfAllExpenses, percentageOfNonRecurringExpenses }) => {
      const previousItem = previousCategoryList.find(previousCategory => previousCategory.category === category);

      return {
        name: category,
        percentage: dataFilter === "all" ? percentageOfAllExpenses : percentageOfNonRecurringExpenses,
        totalCosts: totalCosts,
        previousCosts: previousItem?.totalCosts ?? 0
      }
    });


    const expensesByTag = current.expenseByTag.map(tag => {
      const previousItem = previous.expenseByTag.find(previousTag => previousTag.tag === tag.tag);

      return {
        name: tag.tag,
        percentage: dataFilter === "all" ? tag.percentageOfAllExpenses : tag.percentageOfExpensesOnce,
        totalCosts: tag.totalCosts,
        previousCosts: previousItem?.totalCosts ?? 0
      }
    });

    return {
      totalExpense: {
        current: current.totalExpense,
        previous: previous.totalExpense,
      },
      totalIncome: {
        current: current.totalIncome,
        previous: previous.totalIncome,
      },
      savingsRate: {
        current: current.savingsRate,
        previous: previous.savingsRate
      },
      amountSaved: current.amountSaved,
      expensesByCategory,
      expensesByTag,
    };
  }, [response, dataFilter]);

  const contextValue = useMemo(() => ({
    data,
    loading,
    dataFilter,
    setDataFilter,
    selectedDateRange,
    setSelectedDateRange,
    previousEmpty: data.totalIncome.previous === 0 && data.totalExpense.previous === 0
  }), [loading, data, dataFilter, setDataFilter, selectedDateRange, setSelectedDateRange]);

  return (
    <OverviewContext.Provider value={contextValue}>
      {children}
    </OverviewContext.Provider>
  );
};
