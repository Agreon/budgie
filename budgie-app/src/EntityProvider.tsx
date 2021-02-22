import React, {
  FC, useCallback, useEffect, useMemo, useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getStorageItem, setStorageItem } from './util/storage';
import { Expense } from './util/types';
import { useRequest } from './hooks/use-request';

export interface ExpenseInput {
    category: string;
    costs: string;
    name?: string;
    date: Date;
}

interface EntityCtx {
    expenses: Expense[]
    refetch: () => Promise<void>
    clear: () => Promise<void>
    createExpense: (expense: ExpenseInput) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    updateExpense: (id: string, expense: ExpenseInput) => Promise<void>
}

export const EntityContext = React.createContext<EntityCtx>({
  expenses: [],
  refetch: async () => {},
  clear: async () => {},
  createExpense: async () => {},
  deleteExpense: async () => {},
  updateExpense: async () => {},
});

export const useExpenses = () => React.useContext(EntityContext);

interface Action {
    id: string
    entityId: string
}

interface CreateAction extends Action {
    type: 'Create'
    data: ExpenseInput & {id: string}
}

interface DeleteAction extends Action {
    type: 'Delete'
}

interface UpdateAction extends Action {
    type: 'Update'
    data: ExpenseInput
}

type Actions = CreateAction | DeleteAction | UpdateAction;

/**
 * Für generische Entities
 * - Man provided Actions mit
 *    - online-logic (action: Action) => Promise<unknown|void>
 *    - offline-logic (action: Action, entities: Entity[]) => Entity[]
 * - Provider gibt method mit der action erstellt werden kann aus
 *    -> callAction(action: Action) => Promise<unknown|void>
 */

/**
 * TODO: What is with single expense?
 * => Wir brauchen Tags mit dem list
 * => Oder einfach weitere method, die expense anreichert
 *
 * - Irgendwo ein Icon, dass man offline ist / grade gesynced wird?
 *  -> Vlt sogar als toast
 */
export const EntityProvider: FC = ({ children }) => {
  const api = useRequest();

  // So that no fetch is called before the initial load is finished.
  const [loading, setLoading] = useState(true);

  // TODO: The expenses should be sorted => Check if this works on save
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [actions, setActions] = useState<Actions[]>([]);

  // Initial Load
  useEffect(() => {
    (async () => {
      let storageExpenses: Expense[] = JSON.parse(await getStorageItem('expenses') || '[]');
      const storageActions: Actions[] = JSON.parse(await getStorageItem('actions') || '[]');

      // TODO: Maybe extract these methods => to use them in the methods below
      // Apply all storage actions on the local expenses
      // eslint-disable-next-line no-restricted-syntax
      for (const action of storageActions) {
        console.log('Applying action', action);
        switch (action.type) {
          case 'Create':
            storageExpenses.push({ ...action.data, id: action.entityId });
            break;
          case 'Update':
            storageExpenses = storageExpenses
              .filter(({ id }) => id !== action.entityId)
              .concat({
                ...action.data,
                id: action.entityId,
              });
            break;
          case 'Delete':
            storageExpenses = storageExpenses.filter(({ id }) => id !== action.entityId);
            break;
          default:
            throw Error('Should not happen');
        }
      }

      setExpenses(storageExpenses);
      setActions(storageActions);
      setLoading(false);
    })();
  }, []);

  const saveAction = useCallback(async (action: Actions) => {
    const newActions = [...actions, action];
    await setStorageItem('actions', JSON.stringify(newActions));
    setActions(newActions);
  }, [actions, setActions]);

  const deleteAction = useCallback(async (actionId:string) => {
    const newActions = actions.filter(({ id }) => id !== actionId);
    await setStorageItem('actions', JSON.stringify(newActions));
    setActions(newActions);
  }, [actions, setActions]);

  /**
   * Saves sorted expenses in store.
   */
  const persistExpenses = useCallback(async (expensesToSave: Expense[]) => {
    const sortedExpenses = expensesToSave.sort((a, b) => a.date.getTime() - b.date.getTime());
    await setStorageItem('expenses', JSON.stringify(sortedExpenses));
    setExpenses(sortedExpenses);
  }, [setExpenses]);

  /**
   * CUD Operations
   */

  const saveExpenseInStore = useCallback(async (expense: Expense) => {
    const newExpenses = [...expenses, expense];
    await persistExpenses(newExpenses);
  }, [expenses, persistExpenses]);

  const removeExpenseFromStore = useCallback(async (expenseId: string) => {
    const newExpenses = expenses.filter(({ id }) => id !== expenseId);
    await persistExpenses(newExpenses);
  }, [expenses, persistExpenses]);

  const updateExpenseInStore = useCallback(async (expenseId: string, expense: ExpenseInput) => {
    const newExpenses = expenses
      .filter(({ id }) => id !== expenseId)
      .concat({
        ...expense,
        id: expenseId,
      });
    await persistExpenses(newExpenses);
  }, [expenses, persistExpenses]);

  /**
   * Tries to push the saved actions to the backend.
   * Won't fail if network connection is not available.
   *
   * TODO: What if app is closed between push and delete of action?
   *  => We would need idempotenzy for this (Prio2)
   */
  const syncExpenses = useCallback(async () => {
    console.log('Syncing', actions);
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const action of actions) {
        console.log('Applying action', action);

        switch (action.type) {
          case 'Create':
            await api.post('expense', action.data);
            break;
          case 'Update':
            await api.put(`expense/${action.entityId}`, action.data);
            break;
          case 'Delete':
            await api.delete(`expense/${action.entityId}`);
            break;
          default:
            throw Error('Should not happen');
        }

        await deleteAction(action.id);
      }
    } catch (error) {
      if (error.message === 'Network Error') {
        return;
      }
      throw error;
    }
  }, [api, actions, deleteAction]);

  /**
   * Public methods
   */

  // TODO: We have to make sure, this is does not cause problems if called again during sync
  const refetch = useCallback(async () => {
    console.log('Refetch');

    await syncExpenses();

    try {
      const { data } = await api.get('expense');

      console.log('Updating from remote');
      // TODO: Will this work just like this? Or make problems with cache?
      await persistExpenses(data);
    } catch (err) {
      if (err.message === 'Network Error') {
        console.log('We are offline');
      } else {
        console.error(err);

        throw err;
      }
    }
  }, [expenses, syncExpenses, persistExpenses]);

  const clear = useCallback(async () => {
    persistExpenses([]);
    await setStorageItem('actions', JSON.stringify([]));
    setActions([]);
  }, [persistExpenses, setActions]);

  const createExpense = useCallback(async (expense: ExpenseInput) => {
    console.log('Creating expense', expense);

    const entityId = uuidv4();

    const expenseItem: Expense = {
      ...expense,
      id: entityId,
    };

    try {
      await api.post('expense', expenseItem);
    } catch (err) {
      if (err.message === 'Network Error') {
        await saveAction({
          id: uuidv4(),
          type: 'Create',
          entityId,
          data: { ...expense, id: entityId },
        });
      } else {
        throw err;
      }
    }

    await saveExpenseInStore(expenseItem);
  }, [api, saveAction, saveExpenseInStore]);

  const deleteExpense = useCallback(async (id: string) => {
    console.log('Deleting expense', id);
    try {
      await api.delete(`expense/${id}`);
    } catch (err) {
      if (err.message === 'Network Error') {
        await saveAction({
          id: uuidv4(),
          type: 'Delete',
          entityId: id,
        });
      } else {
        throw err;
      }
    }

    await removeExpenseFromStore(id);
  }, [api, saveAction, removeExpenseFromStore]);

  const updateExpense = useCallback(async (id: string, expense: ExpenseInput) => {
    console.log('Updating expense', id, expense);

    try {
      await api.put(`expense/${id}`, expense);
    } catch (err) {
      if (err.message === 'Network Error') {
        await saveAction({
          id: uuidv4(),
          type: 'Update',
          entityId: id,
          data: expense,
        });
      } else {
        throw err;
      }
    }

    await updateExpenseInStore(id, expense);
  }, [api, saveAction, removeExpenseFromStore]);

  const contextValue = useMemo(() => ({
    expenses,
    refetch,
    clear,
    createExpense,
    deleteExpense,
    updateExpense,
  }), [expenses, refetch, clear, createExpense, deleteExpense, updateExpense]);

  return (
    <EntityContext.Provider value={contextValue}>
      {loading ? null : children}
    </EntityContext.Provider>
  );
};
