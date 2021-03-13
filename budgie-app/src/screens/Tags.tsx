import React, {
  FC, useCallback, useState,
} from 'react';
import {
  SafeAreaView, View,
} from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Button,
  Icon,
  Text,
} from '@ui-kitten/components';
import { useQueryClient } from 'react-query';
import { useApi } from '../hooks/use-request';
import { useToast } from '../ToastProvider';
import { Tag } from '../util/types';
import { Dialog } from '../components/Dialog';
import { TagDialog } from '../components/TagDialog';
import { List } from '../components/List';
import { Query } from '../hooks/use-paginated-query';

const TagItem: FC<{
  item: Tag
  onDelete: () => void
  onEdit: () => void
}> = ({ item, onDelete, onEdit }) => (
  <View style={tailwind('mt-2 justify-center')}>
    <View style={tailwind('p-2 flex-row pt-0 pb-0 justify-between items-center')}>
      <View style={tailwind('ml-1')}>
        <Text category="h5" status="primary" style={tailwind('font-bold')}>{item.name}</Text>
      </View>
      <View style={tailwind('flex-row')}>
        <Button
          appearance="ghost"
          accessoryLeft={props => (
            <Icon
              {...props}
              name="edit-2-outline"
              style={[props?.style, { width: 25, height: 25 }]}
            />
          )}
          onPress={onEdit}
        />
        <Button
          appearance="ghost"
          status="danger"
          accessoryLeft={props => (
            <Icon
              {...props}
              name="trash-2-outline"
              style={[props?.style, { width: 25, height: 25 }]}
            />
          )}
          onPress={onDelete}
        />
      </View>
    </View>
  </View>
);

export const Tags: FC = () => {
  const api = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [createTagDialogVisible, setCreateTagDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const onDelete = useCallback(async () => {
    // TODO: Some kind of loading state would be nice.
    setDeleteDialogVisible(false);
    try {
      await api.delete(`tag/${selectedTag?.id}`);
      queryClient.resetQueries({ queryKey: Query.Tag, exact: true });
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
    setSelectedTag(null);
  }, [selectedTag, api, showToast]);

  const renderTagItem = useCallback(({ item }: { item: Tag }) => (
    <TagItem
      item={item}
      onDelete={() => {
        setSelectedTag(item);
        setDeleteDialogVisible(true);
      }}
      onEdit={() => {
        setSelectedTag(item);
        setCreateTagDialogVisible(true);
      }}
    />
  ), [setSelectedTag, setDeleteDialogVisible]);

  return (
    <SafeAreaView
      style={tailwind('h-full w-full bg-white')}
    >
      <List<Tag>
        title="Tags"
        query={Query.Tag}
        renderItem={renderTagItem}
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
      <TagDialog
        visible={createTagDialogVisible}
        existingTag={selectedTag || undefined}
        onClose={() => setCreateTagDialogVisible(false)}
        onSubmit={() => {
          setSelectedTag(null);
          setCreateTagDialogVisible(false);
          queryClient.resetQueries({ queryKey: Query.Tag, exact: true });
        }}
      />
    </SafeAreaView>
  );
};
