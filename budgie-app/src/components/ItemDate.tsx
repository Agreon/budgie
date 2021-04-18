import React, {
  FC,
} from 'react';
import {
  Text,
} from '@ui-kitten/components';
import tailwind from 'tailwind-rn';
import { useFormattedDate } from '../hooks/use-formatted-date';

export const ItemDate: FC<{date: Date}> = ({ date }) => {
  const formattedDate = useFormattedDate(date);

  return (
    <Text appearance="hint" style={tailwind('text-right')}>
      {formattedDate}
    </Text>
  );
};
