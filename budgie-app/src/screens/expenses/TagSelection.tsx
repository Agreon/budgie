import React, { FC, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Button,
  Icon,
  Text,
} from '@ui-kitten/components';
import { ScrollView } from 'react-native-gesture-handler';
import { Tag } from '../../util/types';
import { TagDialog } from '../../components/TagDialog';

const TagItem: FC<{
  name: string,
  selected: boolean,
  onPress: () => void
}> = ({ name, selected, onPress }) => {
  const selectedStyle = selected ? 'bg-blue-500' : '';

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={tailwind(`border rounded border-gray-300 pb-2 pt-2 pl-3 pr-3 mr-2 ${selectedStyle}`)}>
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
        <ScrollView
          horizontal
          // This is necessary for the last tag to have a visible margin to the border.
          contentContainerStyle={tailwind('pr-2')}
          style={tailwind('flex-row p-2 pr-4 border border-gray-300 rounded-sm')}
        >
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
        </ScrollView>
      ) : (
        <Text>
          No Tags available yet. Create one by clicking +
        </Text>
      )}
      <TagDialog
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
