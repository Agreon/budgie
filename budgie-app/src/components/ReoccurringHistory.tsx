import React, { FC, useState } from 'react';
import { FlatList, View } from 'react-native';
import {
  Button,
  Icon,
  Text,
} from '@ui-kitten/components';
import tailwind from 'tailwind-rn';
import { useNavigation } from '@react-navigation/native';
import { ReoccurringHistoryItem as ReoccurringHistItem } from '../util/types';
import { ItemDivider } from './ItemDivider';
import { useFormattedDate } from '../hooks/use-formatted-date';
import { DeleteDialog } from './DeleteDialog';

const ReoccurringHistoryItem: FC<{
  item: ReoccurringHistItem,
  onEdit: (itemId: string) => void
  onDelete: (itemId: string) => void
}> = ({ item, onEdit, onDelete }) => {
  const formattedStartDate = useFormattedDate(item.start_date);
  const formattedEndDate = useFormattedDate(item.end_date);

  return (
    <View style={tailwind('flex-row justify-between')}>
      <View style={tailwind('flex-col ml-1 pr-2 justify-center')}>
        <View style={tailwind('flex-row items-center')}>
          <Text category="h6">{formattedStartDate}</Text>
          <Text category="h6" style={tailwind('font-bold')}> - </Text>
          <Text category="h6">{formattedEndDate}</Text>
        </View>
      </View>
      <View style={tailwind('flex-row mr-1 items-center')}>
        <Text category="h6" style={tailwind('text-red-400 font-bold text-right')}>
          {item.costs}
          {' '}
          €
        </Text>
        <Button
          appearance="ghost"
          style={{
            paddingRight: 0,
            paddingLeft: 0,
            marginLeft: 10,
          }}
          accessoryLeft={props => (
            <Icon
              {...props}
              name="edit-2-outline"
              style={[props?.style, { width: 25, height: 25 }]}
            />
          )}
          onPress={() => onEdit(item.id)}
        />
        <Button
          appearance="ghost"
          status="danger"
          style={{
            paddingLeft: 0,
            paddingRight: 0,
          }}
          accessoryLeft={props => (
            <Icon
              {...props}
              name="trash-2-outline"
              style={[props?.style, { width: 25, height: 25 }]}
            />
          )}
          onPress={() => onDelete(item.id)}
        />
      </View>
    </View>
  );
};

// TODO: Improve styling
export const ReoccurringHistory: FC<{
  history: ReoccurringHistItem[]
  refresh: () => Promise<void>
}> = ({ history, refresh }) => {
  const navigation = useNavigation();

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  return (
    <>
      <FlatList<ReoccurringHistItem>
        ListHeaderComponent={<View style={tailwind('flex-row justify-center mb-4 mt-2')}><Text category="h5" style={tailwind('font-bold')}>History</Text></View>}
        ItemSeparatorComponent={ItemDivider}
        renderItem={({ item }) => (
          <ReoccurringHistoryItem
            item={item}
            onDelete={() => setItemToDelete(item.id)}
            onEdit={() => navigation.navigate('EditReoccurringHistoryItem', { id: item.id })}
          />
        )}
        data={history}
        keyExtractor={item => item.id}
      />
      <DeleteDialog
        deletePath={`recurring/${itemToDelete}`}
        visible={itemToDelete !== null}
        content="Are you sure you want to delete this history item?"
        onClose={() => setItemToDelete(null)}
        onDeleted={refresh}
      />
    </>
  );
};
