import {
  Button, Card, Modal, Text,
} from '@ui-kitten/components';
import { RenderProp } from '@ui-kitten/components/devsupport';
import React, { FC } from 'react';
import { View, ViewProps } from 'react-native';
import tailwind from 'tailwind-rn';

export const Dialog: FC<{
    visible: boolean
    content: string | React.ReactNode
    header?: RenderProp<ViewProps>
    onSubmit: () => void
    onClose: () => void
  }> = ({
    visible,
    header,
    content,
    onSubmit,
    onClose,
  }) => (
    <Modal
      visible={visible}
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onBackdropPress={onClose}
    >
      <Card
        header={header}
        style={tailwind('ml-5 mr-5')}
        footer={(props) => (
          <View {...props} style={tailwind('flex-1 flex-row justify-between m-2 mb-10')}>
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
        {typeof content === 'string' ? <Text>{content}</Text> : content}
      </Card>
    </Modal>
  );
