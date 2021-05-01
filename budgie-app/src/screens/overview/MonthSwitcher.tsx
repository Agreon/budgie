import React, {
  FC, useMemo,
} from 'react';
import {
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import dayjs from 'dayjs';
import { View, StatusBar } from 'react-native';
import tailwind from 'tailwind-rn';
import { useOverviewContext } from './OverviewProvider';

export const MonthSwitcher: FC = () => {
  const { selectedDateRange, setSelectedDateRange, previousEmpty } = useOverviewContext();

  const title = useMemo(
    () => selectedDateRange[0].format('MMMM YYYY'),
    [selectedDateRange],
  );
  const disableNextMonth = useMemo(
    () => dayjs(selectedDateRange[0]).add(1, 'month').isAfter(dayjs()),
    [selectedDateRange],
  );

  return (
    <View
      style={{
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight : 0,
        backgroundColor: 'white',
        zIndex: 20,
      }}
    >
      <TopNavigation
        title={() => (
          <Text style={tailwind('text-xl font-bold')}>
            {title}
          </Text>
        )}
        alignment="center"
        accessoryLeft={previousEmpty ? undefined : props => (
          <TopNavigationAction
            {...props}
            style={{ scaleX: 1.3, scaleY: 1.3 }}
            icon={iconProps => <Icon {...iconProps} name="arrow-back-outline" />}
            onPress={() => {
              setSelectedDateRange([
                dayjs(selectedDateRange[0]).subtract(1, 'month').startOf('month'),
                dayjs(selectedDateRange[0]).subtract(1, 'month').endOf('month'),
              ]);
            }}
          />
        )}
        accessoryRight={disableNextMonth ? undefined : props => (
          <TopNavigationAction
            {...props}
            style={{ scaleX: 1.3, scaleY: 1.3 }}
            icon={iconProps => <Icon {...iconProps} name="arrow-forward-outline" />}
            onPress={() => {
              setSelectedDateRange([
                dayjs(selectedDateRange[0]).add(1, 'month').startOf('month'),
                dayjs(selectedDateRange[0]).add(1, 'month').endOf('month'),
              ]);
            }}
          />
        )}
      />
    </View>
  );
};
