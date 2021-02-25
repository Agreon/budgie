import { useIsFocused } from '@react-navigation/native';
import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import {
  RefreshControl, SafeAreaView, View, FlatList,
} from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Button,
  Divider,
  Icon,
  Text,
} from '@ui-kitten/components';
import { Header } from '../components/Header';
import { useApi } from '../hooks/use-request';
import { useToast } from '../ToastProvider';
import { Tag } from '../util/types';

const TagItem: FC<{
  item: Tag;
}> = ({ item }) => (
  <View style={tailwind('mt-2')}>
    <View style={tailwind('p-2 flex-row justify-between')}>
      <View style={tailwind('ml-1')}>
        <Text category="h5" status="primary" style={tailwind('font-bold')}>{item.name}</Text>
      </View>
      <View style={tailwind('flex-row mr-1')}>
        <Text category="h6" style={tailwind('text-red-400 font-bold text-right mr-4')}>
          Edit
        </Text>
        <Text category="h6" style={tailwind('text-red-400 font-bold text-right')}>
          Delete
        </Text>
      </View>
    </View>
    <Divider style={tailwind('bg-gray-300 ml-6 mr-6 mt-2 mb-1')} />
  </View>
);

export const Tags: FC = () => {
  const api = useApi();
  const isFocused = useIsFocused();
  const { showToast } = useToast();

  const [tags, setTags] = useState<Tag[]>([]);

  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('tag');

      setTags(data);
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }

    setLoading(false);
  }, [api, setTags, showToast, setLoading]);

  useEffect(() => {
    (async () => {
      if (!isFocused) return;

      await fetchData();
    })();
  }, [isFocused]);

  return (
    <SafeAreaView
      style={tailwind('h-full w-full bg-white')}
    >
      <FlatList<Tag>
        style={tailwind('h-full w-full')}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={() => <Header title="Tags" />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
        renderItem={TagItem}
        data={tags}
        keyExtractor={item => item.id}
      />
      <Button
        style={tailwind('absolute right-6 bottom-5')}
        status="info"
        accessoryLeft={props => (
          <Icon {...props} name="plus-outline" />
        )}
      />
    </SafeAreaView>
  );
};
