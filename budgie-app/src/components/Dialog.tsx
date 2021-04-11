import {
  Button, Layout, Modal, Text,
} from '@ui-kitten/components';
import React, { FC } from 'react';
import { View } from 'react-native';
import tailwind from 'tailwind-rn';
import { LoadingIndicator } from './LoadingIndicator';

export interface DialogProps {
  visible: boolean
  content: string | React.ReactNode
  loading?: boolean
  onSubmit: () => void
  onClose: () => void
}

export const Dialog: FC<DialogProps> = ({
  visible,
  content,
  loading,
  onSubmit,
  onClose,
}) => (
  <Modal
    visible={visible}
    backdropStyle={tailwind('bg-black bg-opacity-50')}
    onBackdropPress={onClose}
    style={tailwind('w-full p-10')}
  >
    <Layout style={tailwind('flex-1 p-5 pb-3')}>
      {typeof content === 'string' ? <Text>{content}</Text> : content}
      <View style={tailwind('flex-1 flex-row justify-between mt-3')}>
        <Button
          size="small"
          status="basic"
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          size="small"
          status="danger"
          onPress={onSubmit}
          accessoryLeft={loading ? props => <LoadingIndicator {...props} status="basic" size="tiny" /> : undefined}
        >
          Delete
        </Button>
      </View>
    </Layout>
  </Modal>
);
