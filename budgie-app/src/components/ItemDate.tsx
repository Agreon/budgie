import React, {
  FC, useMemo,
} from 'react';
import {
  Text,
} from '@ui-kitten/components';
import dayjs from 'dayjs';
import tailwind from 'tailwind-rn';

const currentYear = dayjs().year();

export const ItemDate: FC<{date: Date}> = ({ date }) => {
  const formattedDate = useMemo(
    () => (
      dayjs(date).year() !== currentYear
        ? dayjs(date).format('DD.MM.YY')
        : dayjs(date).format('DD.MM.')),
    [date],
  );

  return (
    <Text appearance="hint" style={tailwind('text-right')}>
      {formattedDate}
    </Text>
  );
};
