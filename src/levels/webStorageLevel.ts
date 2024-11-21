import { PersistenceLevel, WebStorageLike } from '../index';

type WebStorageLevelProps = Omit<
  Partial<PersistenceLevel>,
  'get' | 'set' | 'delete' | 'clear'
> & {
  webStorage: WebStorageLike;
  prefix: string;
};

export const createWebStorageLevel = ({
  webStorage,
  prefix = '',
  ...rest
}: WebStorageLevelProps): PersistenceLevel => ({
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
    return webStorage.setItem(prefix + key, JSON.stringify(value));
  },
  clear: () => {
    return webStorage.clear();
  },
  delete: ({ key }) => {
    return webStorage.removeItem(prefix + key);
  },
  ...rest,
});
