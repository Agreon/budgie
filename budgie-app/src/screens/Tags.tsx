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
import { Dialog } from '../components/Dialog';
import { CreateTagDialog } from '../components/CreateTagDialog';

/**
 * TODO: Increase icon size?
 */
const TagItem: FC<{
  item: Tag
  onDelete: () => void
}> = ({ item, onDelete }) => (
  <View style={tailwind('mt-2 justify-center')}>
    <View style={tailwind('p-2 flex-row pt-0 pb-0 justify-between items-center')}>
      <View style={tailwind('ml-1')}>
        <Text category="h5" status="primary" style={tailwind('font-bold')}>{item.name}</Text>
      </View>
      <View style={tailwind('flex-row')}>
        <Button
          appearance="ghost"
          accessoryLeft={props => <Icon {...props} name="edit-2-outline" />}
        />
        <Button
          appearance="ghost"
          status="danger"
          accessoryLeft={props => <Icon {...props} name="trash-2-outline" />}
          onPress={onDelete}
        />
      </View>
    </View>
    <Divider style={tailwind('bg-gray-300 ml-6 mr-6 mt-2 mb-1')} />
  </View>
);

export const Tags: FC = () => {
  const api = useApi();
  const isFocused = useIsFocused();
  const { showToast } = useToast();

  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [createTagDialogVisible, setCreateTagDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

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

  const onDelete = useCallback(async () => {
    // TODO: Some kind of loading state would be nice.
    setDeleteDialogVisible(false);
    try {
      await api.delete(`tag/${selectedTag?.id}`);
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
    setSelectedTag(null);
  }, [selectedTag, api, showToast]);

  useEffect(() => {
    (async () => {
      if (!isFocused) return;

      await fetchData();
    })();
  }, [isFocused]);

  const renderTagItem = useCallback(({ item }: { item: Tag }) => (
    <TagItem
      item={item}
      onDelete={() => {
        setSelectedTag(item);
        setDeleteDialogVisible(true);
      }}
    />
  ), [setSelectedTag, setDeleteDialogVisible]);

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
        renderItem={renderTagItem}
        data={tags}
        keyExtractor={item => item.id}
      />
      <Button
        style={tailwind('absolute right-6 bottom-5')}
        status="info"
        accessoryLeft={props => (
          <Icon {...props} name="plus-outline" />
        )}
        onPress={() => setCreateTagDialogVisible(true)}
      />
      <Dialog
        visible={deleteDialogVisible}
        content="Are you sure you want to delete this tag?"
        onClose={() => setDeleteDialogVisible(false)}
        onSubmit={onDelete}
      />
      <CreateTagDialog
        visible={createTagDialogVisible}
        onClose={() => setCreateTagDialogVisible(false)}
        onSubmit={() => {
          fetchData();
          setCreateTagDialogVisible(false);
        }}
      />
    </SafeAreaView>
  );
};
