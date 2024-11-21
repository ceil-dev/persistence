import { PersistenceLevel, StorageEntry, NextSettings } from '../';

export const createRuntimeLevel = (props?: {
  next?: NextSettings;
  defaultData?: Record<string, StorageEntry>;
  prefix?: string;
}): PersistenceLevel => {
  const storage: Record<string, StorageEntry> = props?.defaultData || {};

  const next = props?.next;
  const prefix = props?.prefix || '';

  return {
    get: ({ key }) => {
      return storage[prefix + key];
    },
    set: ({ key, value }) => {
      storage[prefix + key] = value;
      return;
    },
    delete: ({ key }) => {
      delete storage[prefix + key];
      return;
    },
    clear: () => {
      const keys = Object.getOwnPropertyNames(storage);
      for (const key of keys) {
        delete storage[key];
      }
      return;
    },
    next: next,
  };
};
