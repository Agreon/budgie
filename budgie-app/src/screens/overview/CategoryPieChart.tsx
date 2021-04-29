import React, { FC, useMemo } from 'react';
import { VictoryPie, VictoryTheme } from 'victory-native';
import { OverviewData } from '../../util/types';

/**
      labels={({ datum }) => `${datum.x} - ${datum.y}`}

    TODO: Maybe highlight list items onClick (https://formidable.com/open-source/victory/guides/events#single-component-events)
      => If tooltips wont work
 */
export const CategoryPieChart: FC<{ data:OverviewData }> = ({
  data: { expenseByCategory },
}) => {
  const data = useMemo(
    () => expenseByCategory?.map(({ category, percentageOfAllExpenses }) => ({
      x: category,
      y: parseInt(percentageOfAllExpenses, 10),
      label: category,
    })) ?? [],
    [expenseByCategory],
  );

  return (
    <VictoryPie
      innerRadius={100}
      startAngle={-90}
      endAngle={90}
      height={200}
      padding={{
        top: 10,
        left: 0,
        right: 80,
        bottom: -150,
      }}
      animate={{ duration: 1000 }}
      style={{ labels: { fill: 'white', opacity: 0 } }}
      theme={VictoryTheme.material}
      data={data}
    />
  );
};
