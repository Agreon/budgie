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

export const MonthSwitcher: FC<{
    selectedDate: Date,
    setSelectedDate: (date: Date) => void,
    disablePreviousMonth: boolean
  }> = ({
    selectedDate,
    setSelectedDate,
    disablePreviousMonth,
  }) => {
    const title = useMemo(() => dayjs(selectedDate).format('MMMM YYYY'), [selectedDate]);
    const disableNextMonth = useMemo(() => dayjs(selectedDate).add(1, 'month').isAfter(dayjs()), [selectedDate]);

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
          accessoryLeft={disablePreviousMonth ? undefined : props => (
            <TopNavigationAction
              {...props}
              style={{ scaleX: 1.3, scaleY: 1.3 }}
              icon={iconProps => <Icon {...iconProps} name="arrow-back-outline" />}
              onPress={() => {
                setSelectedDate(
                  dayjs(selectedDate).subtract(1, 'month').toDate(),
                );
              }}
            />
          )}
          accessoryRight={disableNextMonth ? undefined : props => (
            <TopNavigationAction
              {...props}
              style={{ scaleX: 1.3, scaleY: 1.3 }}
              icon={iconProps => <Icon {...iconProps} name="arrow-forward-outline" />}
              onPress={() => {
                if (disableNextMonth) return;
                setSelectedDate(
                  dayjs(selectedDate).add(1, 'month').toDate(),
                );
              }}
            />
          )}
        />
      </View>
    );
  };
