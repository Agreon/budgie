import {
  Button, Card, Modal, Text,
} from '@ui-kitten/components';
import React, { FC } from 'react';
import { View } from 'react-native';
import tailwind from 'tailwind-rn';

export const Dialog: FC<{
    visible: boolean
    text: string
    onSubmit: () => void
    onClose: () => void
  }> = ({
    visible, text, onSubmit, onClose,
  }) => (
    <Modal
      visible={visible}
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Card
        footer={(props) => (
          <View {...props} style={tailwind('flex-1 flex-row justify-end m-2')}>
            <Button
              size="small"
              status="basic"
              onPress={onClose}
              style={{ marginHorizontal: 2 }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              status="danger"
              onPress={onSubmit}
              style={{ marginHorizontal: 2 }}
            >
              Delete
            </Button>
          </View>
        )}
      >
        <Text>{text}</Text>
      </Card>
    </Modal>
  );
