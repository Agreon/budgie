import { StatusBar } from 'react-native';

export const LOADING_INDICATOR_OFFSET = StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40;

export const CATEGORIES = [
  'Food',
  'Clothes',
  'DinnerOutside',
  'Rent',
  'Electricity',
  'GEZ',
  'Insurance',
  'Cellphone',
  'PublicTransport',
  'Internet',
  'HygieneMedicine',
  'LeisureTime',
  'Education',
  'Travel',
  'Other',
] as const;
