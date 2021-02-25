import React, { FC, useCallback, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Button,
  Icon,
  IconProps,
  Input,
  Layout,
  Modal,
  Text,
} from '@ui-kitten/components';
import { useApi } from '../hooks/use-request';
import { LoadingIndicator } from './LoadingIndicator';
import { useToast } from '../ToastProvider';

const PlusIcon = (props: IconProps) => (
  <Icon {...props} name="plus-outline" />
);

// TODO: Move
export interface Tag {
  id: string;
  name: string;
}

const TagItem: FC<{
  name: string,
  selected: boolean,
  onPress: () => void
}> = ({ name, selected, onPress }) => {
  const selectedStyle = selected ? ' bg-blue-500' : '';

  return (
    <TouchableWithoutFeedback delayPressIn={0} onPressIn={() => onPress()}>
      <View style={tailwind(`border rounded border-gray-300 pb-2 pt-2 pl-3 pr-3 mr-2${selectedStyle}`)}>
        <Text style={selected ? tailwind('text-white') : {}}>{name}</Text>
      </View>
    </TouchableWithoutFeedback>

  );
};

const CreateTagDialog: FC<{
  visible: boolean
  onSubmit: () => void
  onClose: () => void
}> = ({
  visible, onSubmit, onClose,
}) => {
  const api = useApi();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const onCreate = useCallback(async () => {
    try {
      await api.post('/tag', { name });
      onSubmit();
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
    setLoading(false);
  }, [api, onSubmit, name, showToast]);

  return (
    <Modal
      visible={visible}
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onBackdropPress={onClose}
      style={tailwind('w-full p-10')}
    >
      <Layout style={tailwind('flex-1 p-5 pb-3')}>
        <View style={tailwind('mb-2')}>
          <Text category="s1">Create Tag</Text>
        </View>
        <Input
          style={tailwind('mt-1')}
          value={name}
          onChangeText={(text) => setName(text)}
          label="Name"
          autoFocus
          onSubmitEditing={onCreate}
        />
        <View style={tailwind('flex-1 flex-row justify-between mt-2')}>
          <Button
            size="small"
            status="basic"
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            size="small"
            onPress={onCreate}
            disabled={loading}
            accessoryLeft={loading ? LoadingIndicator : undefined}
          >
            Create
          </Button>
        </View>
      </Layout>
    </Modal>
  );
};

/**
 * TODO:
 *  - Directly select tag after it was created
 */
export const TagSelection: FC<{
  available: Tag[],
  selected: Tag[],
  onSelectionChanged: (selected: Tag[]) => void
}> = ({ available, selected, onSelectionChanged }) => {
  const [createTagDialogVisible, setCreateTagDialogVisible] = useState(false);

  return (
    <View>
      <View style={tailwind('flex-row justify-between items-center mb-1')}>
        <Text category="c1">Tags</Text>
        <Button appearance="ghost" accessoryLeft={PlusIcon} onPress={() => setCreateTagDialogVisible(true)} />
      </View>
      <View style={tailwind('flex-row p-2 border border-gray-300 rounded-sm')}>
        {available.map(tag => (
          <TagItem
            key={tag.id}
            name={tag.name}
            selected={selected.find(s => s.id === tag.id) !== undefined}
            onPress={() => (
              selected.find(s => s.id === tag.id)
                ? onSelectionChanged(selected.filter(s => s.id !== tag.id))
                : onSelectionChanged([...selected, available.find(s => s.id === tag.id)!])
            )}
          />
        ))}
      </View>
      <CreateTagDialog
        visible={createTagDialogVisible}
        onClose={() => setCreateTagDialogVisible(false)}
        onSubmit={() => setCreateTagDialogVisible(false)}
      />
    </View>
  );
};