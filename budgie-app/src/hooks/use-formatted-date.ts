import dayjs from 'dayjs';
import { useMemo } from 'react';

const currentYear = dayjs().year();

export const useFormattedDate = (date?: Date) => {
  const formattedDate = useMemo(
    () => {
      if (!date) return '';

      return (
        dayjs(date).year() !== currentYear
          ? dayjs(date).format('DD.MM.YY')
          : dayjs(date).format('DD.MM.')
      );
    },
    [date],
  );

  return formattedDate;
};
