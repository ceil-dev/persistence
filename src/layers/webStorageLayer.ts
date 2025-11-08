import { PersistenceLayerApi, WebStorageLike } from '../index';

type WebStorageLayerProps = {
  webStorage: WebStorageLike;
  prefix: string;
};

export const createWebStorageLayer = ({
  webStorage,
  prefix = '',
}: WebStorageLayerProps): PersistenceLayerApi => ({
  get: async ({ key }) => {
    const strEntry = await webStorage.getItem(prefix + key);
    if (typeof strEntry !== 'string') {
      return;
    }
    const entry = JSON.parse(strEntry);
    // TODO: validate
    return entry;
  },
  set: ({ key, value }) => {
    webStorage.setItem(prefix + key, JSON.stringify(value));
    return true; // TODO: check success of async operations
  },
  clear: () => {
    webStorage.clear();
    return true; // TODO: check success of async operations
  },
  delete: ({ key }) => {
    webStorage.removeItem(prefix + key);
    return true; // TODO: check success of async operations
  },
});
