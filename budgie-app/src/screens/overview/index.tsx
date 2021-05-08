import React, {
  FC,
} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Dayjs } from 'dayjs';
import { MonthOverview } from './MonthOverview';
import { CategoryOverview } from './CategoryOverview';

export type OverviewStackParamList = {
  'MonthOverview': undefined,
  'CategoryOverview': { startDate: Dayjs, endDate: Dayjs, category: string }
};

const { Navigator, Screen } = createStackNavigator<OverviewStackParamList>();

export const Overview: FC = () => (
  <Navigator
    headerMode="none"
    initialRouteName="MonthOverview"
  >
    <Screen
      name="MonthOverview"
      component={MonthOverview}
    />
    <Screen
      name="CategoryOverview"
      component={CategoryOverview}
    />
  </Navigator>
);
