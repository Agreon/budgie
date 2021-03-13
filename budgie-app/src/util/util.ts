import { CATEGORIES } from './globals';

export const getIndexOfCategory = (category: string) => {
  const index = CATEGORIES.findIndex((c) => c === category);
  if (index < 0) {
    console.warn('Could not find index for category', category);
    return 0;
  }

  return index;
};
