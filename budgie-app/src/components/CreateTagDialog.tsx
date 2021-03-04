import React, { FC, useCallback, useState } from 'react';
import { View } from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Button,
  Input,
  Layout,
  Modal,
  Text,
} from '@ui-kitten/components';
import { LoadingIndicator } from './LoadingIndicator';
import { useApi } from '../hooks/use-request';
import { useToast } from '../ToastProvider';
import { Tag } from '../util/types';

export const CreateTagDialog: FC<{
    visible: boolean
    onSubmit: (tag: Tag) => void
    onClose: () => void
  }> = ({
    visible, onSubmit, onClose,
  }) => {
    const api = useApi();
    const { showToast } = useToast();

    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const onCreate = useCallback(async () => {
      try {
        const { data } = await api.post('/tag', { name });
        onSubmit(data);
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
      setLoading(false);
    }, [api, onSubmit, name, showToast]);

    return (
      <Modal
        visible={visible}
        backdropStyle={tailwind('bg-black bg-opacity-50')}
        onBackdropPress={onClose}
        style={tailwind('w-full p-10')}
      >
        <Layout style={tailwind('flex-1 p-5 pb-3')}>
          <View style={tailwind('mb-2')}>
            <Text category="s1">Create Tag</Text>
          </View>
          <Input
            style={tailwind('mt-1')}
            value={name}
            onChangeText={(text) => setName(text)}
            label="Name"
            autoFocus
            onSubmitEditing={onCreate}
          />
          <View style={tailwind('flex-1 flex-row justify-between mt-2')}>
            <Button
              size="small"
              status="basic"
              onPress={onClose}
            >
              Cancel
            </Button>
            <Button
              size="small"
              onPress={onCreate}
              disabled={loading}
              accessoryLeft={loading ? LoadingIndicator : undefined}
            >
              Create
            </Button>
          </View>
        </Layout>
      </Modal>
    );
  };
