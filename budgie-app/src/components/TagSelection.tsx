import React, { FC } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Text,
} from '@ui-kitten/components';

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

export const TagSelection: FC<{
    available: Tag[],
    selected: Tag[],
    onToggle: (tagId: string) => void
  }> = ({ available, selected, onToggle }) => (
    <View style={tailwind('mt-4')}>
      <View style={tailwind('flex-row justify-start mb-1')}>
        <Text>Tags</Text>
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
    </View>
  );
