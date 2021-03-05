import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
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

export const TagDialog: FC<{
    visible: boolean
    existingTag?: Tag
    onSubmit: (tag: Tag) => void
    onClose: () => void
  }> = ({
    visible, existingTag, onSubmit, onClose,
  }) => {
    const api = useApi();
    const { showToast } = useToast();

    const [name, setName] = useState(existingTag?.name || '');
    const [loading, setLoading] = useState(false);

    const onCreate = useCallback(async () => {
      try {
        let response;
        if (existingTag) {
          response = await api.put(`/tag/${existingTag.id}`, { name });
        } else {
          response = await api.post('/tag', { name });
        }
        onSubmit(response.data);
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
      setLoading(false);
    }, [api, onSubmit, name, showToast, existingTag]);

    useEffect(() => {
      if (existingTag && existingTag.name !== '' && name === '') {
        setName(existingTag.name);
      }
    }, [existingTag]);

    return (
      <Modal
        visible={visible}
        backdropStyle={tailwind('bg-black bg-opacity-50')}
        onBackdropPress={onClose}
        style={tailwind('w-full p-10')}
      >
        <Layout style={tailwind('flex-1 p-5 pb-3')}>
          <View style={tailwind('mb-2')}>
            <Text category="s1">{existingTag ? 'Edit Tag' : 'Create Tag'}</Text>
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
              {existingTag ? 'Save' : 'Create' }
            </Button>
          </View>
        </Layout>
      </Modal>
    );
  };
