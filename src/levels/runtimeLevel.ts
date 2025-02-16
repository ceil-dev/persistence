import {
  PersistenceLevel,
  StorageEntry,
  NextSettings,
  getDeep,
  setDeep,
} from '../';

export const createRuntimeLevel = (props?: {
  next?: NextSettings;
  defaultData?: Record<string, StorageEntry>;
  prefix?: string;
}): PersistenceLevel => {
  const storage: Record<string, StorageEntry> = props?.defaultData || {};

  const next = props?.next;
  const prefix = props?.prefix || '';

  return {
    get: ({ key, path }) => {
      const root = storage[prefix + key];

      if (!path?.length) return root;

      return getDeep(storage[prefix + key]?.value, path);
    },
    set: ({ key, path, value }) => {
      if (!path?.length) {
        storage[prefix + key] = value;
        return true;
      } else {
        return setDeep(storage[prefix + key], ['value', ...path], value.value);
      }
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
    supportsPaths: true,
  };
};
