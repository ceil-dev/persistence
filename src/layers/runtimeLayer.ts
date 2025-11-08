import { PersistenceLayerApi, StorageEntry, getDeep, setDeep } from '..';

export const createRuntimeLayer = (props?: {
  defaultData?: Record<string, StorageEntry>;
  prefix?: string;
}): PersistenceLayerApi => {
  const storage: Record<string, StorageEntry> = props?.defaultData || {};

  const prefix = props?.prefix || '';

  return {
    get: ({ key, path }) => {
      const root = storage[prefix + key];

      if (!(prefix + key in storage) || !path?.length) return root;

      return { value: getDeep(storage[prefix + key]?.value, path) };
    },
    set: ({ key, path, value }) => {
      if (!path?.length) {
        storage[prefix + key] = value;
        return true;
      } else {
        return setDeep(storage[prefix + key], ['value', ...path], value.value);
      }
    },
    delete: ({ key, path }) => {
      if (path?.length) {
        const parentVal = getDeep(storage, [
          prefix + key,
          'value',
          ...path.slice(0, -1),
        ]);
        if (!parentVal) return false;
        if (Array.isArray(parentVal)) {
          const index = path.slice(-1)[0];
          // TODO: support numbers for keys
          if (!Number.isInteger(Number(index))) {
            return false;
          }
          parentVal.splice(Number(index), 1);
        } else if (typeof parentVal === 'object') {
          delete parentVal[path.slice(-1)[0]];
        } else {
          return false;
        }
      } else {
        delete storage[prefix + key];
      }
      return true;
    },
    clear: () => {
      const keys = Object.keys(storage);
      for (const key of keys) {
        delete storage[key];
      }
      return true;
    },
    supportsPaths: true,
  };
};
