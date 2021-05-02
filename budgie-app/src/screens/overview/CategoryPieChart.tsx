import React, { FC, useMemo } from 'react';
import { VictoryPie, VictoryTheme } from 'victory-native';
import { useOverviewContext } from './OverviewProvider';

/**
      labels={({ datum }) => `${datum.x} - ${datum.y}`}

    TODO: Maybe highlight list items onClick
     (https://formidable.com/open-source/victory/guides/events#single-component-events)
      => If tooltips wont work
 */
export const CategoryPieChart: FC = () => {
  const { data: { expensesByCategory } } = useOverviewContext();

  const data = useMemo(
    () => expensesByCategory.map(({ name, percentage }) => ({
      x: name,
      y: percentage,
    })),
    [expensesByCategory],
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
