import React, { FC, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Button,
  Icon,
  Text,
} from '@ui-kitten/components';
import { Tag } from '../../util/types';
import { CreateTagDialog } from '../../components/CreateTagDialog';

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

export const TagSelection: FC<{
  available: Tag[],
  selected: Tag[],
  onSelectionChanged: (selected: Tag[]) => void
  onTagCreated: (tag: Tag) => void
}> = ({
  available,
  selected,
  onSelectionChanged,
  onTagCreated,
}) => {
  const [createTagDialogVisible, setCreateTagDialogVisible] = useState(false);

  return (
    <View>
      <View style={tailwind('flex-row justify-between items-center mb-1')}>
        <Text category="c1">Tags</Text>
        <Button appearance="ghost" accessoryLeft={props => (<Icon {...props} name="plus-outline" />)} onPress={() => setCreateTagDialogVisible(true)} />
      </View>
      {available.length ? (
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
      ) : (
        <Text>
          No Tags available yet. Create one ;)
        </Text>
      )}
      <CreateTagDialog
        visible={createTagDialogVisible}
        onClose={() => setCreateTagDialogVisible(false)}
        onSubmit={tag => {
          onTagCreated(tag);
          setCreateTagDialogVisible(false);
        }}
      />
    </View>
  );
};
