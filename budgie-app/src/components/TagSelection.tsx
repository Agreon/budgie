import React, { FC, useCallback, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Button,
  Icon,
  IconProps,
  Input,
  Text,
} from '@ui-kitten/components';
import { Dialog } from './Dialog';

const PlusIcon = (props: IconProps) => (
  <Icon {...props} name="plus-outline" />
);

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
  const [name, setName] = useState('');
  const onCreate = useCallback(() => {
    console.log('TODO: API call');
    onSubmit();
  }, [onSubmit]);

  return (
    <Dialog
      visible={visible}
      onSubmit={onCreate}
      onClose={onClose}
      header={(props) => (
        <View {...props}>
          <Text category="s1">Create Tag</Text>
        </View>
      )}
      content={(
        <Input
          style={tailwind('mt-1')}
          value={name}
          onChangeText={(text) => setName(text)}
          label="Name"
          autoFocus
        />
      )}
    />
  );
};

/**
 * TODO: Rather provide a onSelectionChanged instead of onToggle
 */
export const TagSelection: FC<{
  available: Tag[],
  selected: Tag[],
  onToggle: (tagId: string) => void
}> = ({ available, selected, onToggle }) => {
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
            onPress={() => onToggle(tag.id)}
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
