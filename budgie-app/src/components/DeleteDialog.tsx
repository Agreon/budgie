import React, { FC, useCallback, useState } from 'react';
import { useApi } from '../hooks/use-request';
import { useToast } from '../ToastProvider';
import { Dialog, DialogProps } from './Dialog';

export interface DeleteDialogProps extends Omit<DialogProps, 'onSubmit'> {
    deletePath: string
    onDeleted: () => Promise<void> | void
}

export const DeleteDialog: FC<DeleteDialogProps> = ({ onDeleted, deletePath, ...props }) => {
  const api = useApi();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const onDelete = useCallback(async () => {
    setLoading(true);
    try {
      await api.delete(deletePath);
      await onDeleted();
      props.onClose();
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
    setLoading(false);
  }, [deletePath, api, showToast, onDeleted]);

  return (
    <Dialog {...props} onSubmit={onDelete} loading={loading} />
  );
};
