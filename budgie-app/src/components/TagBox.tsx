import React, { FC } from 'react';
import { Text } from '@ui-kitten/components';
import tailwind from 'tailwind-rn';
import { Tag } from '../util/types';

export const TagBox: FC<{tag: Tag}> = ({ tag }) => (
  <Text
    style={tailwind('border rounded border-gray-300 p-1')}
    category="c1"
  >
    {tag.name}
  </Text>
);
