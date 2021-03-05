import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import {
  SafeAreaView, FlatList, RefreshControl, View, TouchableWithoutFeedback,
} from 'react-native';

import dayjs from 'dayjs';
import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button, Divider, Icon, Text,
} from '@ui-kitten/components';
import { useIsFocused } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { Header } from '../../components/Header';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { LOADING_INDICATOR_OFFSET } from '../../util/globals';
import { IncomesStackParamList } from '.';
import { Income } from '../../util/types';

// TODO: Extract stuff / Center Name like with Tags
const IncomeItem: FC<{
    item: Income;
    onPress: (id: string) => void
  }> = ({ item, onPress }) => (
    <TouchableWithoutFeedback delayPressIn={0} onPress={() => onPress(item.id)}>
      <View style={tailwind('mt-2 justify-center')}>
        <View style={tailwind('p-2 flex-row pt-0 pb-0 justify-between items-center')}>
          <View style={tailwind('ml-1')}>
            <Text category="h5" status="primary" style={tailwind('font-bold')}>{item.name}</Text>
          </View>
          <View style={tailwind('flex-col justify-between mr-1')}>
            <Text appearance="hint" style={tailwind('text-right')}>{dayjs(item.date).format('DD.MM.')}</Text>
            <Text category="h6" style={tailwind('text-red-400 font-bold text-right')}>
              {item.costs}
              {' '}
              €
            </Text>
          </View>
        </View>
        <Divider style={tailwind('bg-gray-300 ml-6 mr-6 mt-2 mb-1')} />
      </View>
    </TouchableWithoutFeedback>
  );

export const IncomeList: FC<{
    navigation: StackNavigationProp<IncomesStackParamList, 'Incomes'>
  }> = ({ navigation }) => {
    const api = useApi();
    const isFocused = useIsFocused();
    const { showToast } = useToast();

    const [incomes, setIncomes] = useState<Income[]>([]);

    const [loading, setLoading] = useState(false);
    // TODO: Extract to use-request or something similar.
    const fetchData = useCallback(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('income');

        setIncomes(data);
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }

      setLoading(false);
    }, [api, setIncomes, showToast, setLoading]);

    useEffect(() => {
      (async () => {
        if (!isFocused) return;

        await SplashScreen.hideAsync();
        await fetchData();
      })();
    }, [isFocused]);

    return (
      <SafeAreaView
        style={tailwind('h-full w-full bg-white')}
      >
        <FlatList<Income>
          style={tailwind('w-full')}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={() => <Header title="Incomes" />}
          refreshControl={(
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchData}
              progressViewOffset={LOADING_INDICATOR_OFFSET}
            />
          )}
          renderItem={({ item }) => (
            <IncomeItem
              item={item}
              onPress={id => { navigation.navigate('EditIncome', { id }); }}
            />
          )}
          data={incomes}
          keyExtractor={item => item.id}
        />
        <Button
          style={tailwind('absolute right-6 bottom-5')}
          status="info"
          accessoryLeft={props => (
            <Icon {...props} name="plus-outline" />
          )}
          onPress={() => navigation.navigate('CreateIncome')}
        />
      </SafeAreaView>
    );
  };
