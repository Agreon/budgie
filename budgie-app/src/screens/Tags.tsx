import { useIsFocused } from '@react-navigation/native';
import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { RefreshControl } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import tailwind from 'tailwind-rn';
import { Header } from '../components/Header';
import { Tag } from '../components/TagSelection';
import { useApi } from '../hooks/use-request';
import { useToast } from '../ToastProvider';

export const Tags: FC = () => {
  const api = useApi();
  const isFocused = useIsFocused();
  const { showToast } = useToast();

  const [tags, setTags] = useState<Tag[]>([]);

  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('tags');

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
        style={tailwind('w-full')}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={() => <Header title="Tags" />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
        renderItem={({ item }) => (
          <span>{item.name}</span>
        )}
        data={tags}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
};
