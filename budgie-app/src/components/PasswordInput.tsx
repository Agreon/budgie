import {
  Icon, IconProps, Input, InputProps,
} from '@ui-kitten/components';
import React, { FC, useState } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import tailwind from 'tailwind-rn';

export const PasswordInput: FC<InputProps> = (inputProps) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const renderIcon = (props: IconProps) => (
    <TouchableWithoutFeedback onPress={() => setSecureTextEntry(!secureTextEntry)}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  return (
    <Input
      style={tailwind('mt-4')}
      accessoryRight={renderIcon}
      secureTextEntry={secureTextEntry}
      {...inputProps}
    />
  );
};
