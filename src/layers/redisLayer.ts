import { PersistenceLayerApi } from '../index';

type RedisClientLike = {
  get: (
    key: string
  ) =>
    | void
    | undefined
    | null
    | string
    | Promise<void | undefined | null | string>;
  set: (key: string, value: string) => any;
  del: (key: string) => any;
};

type RedisLayerProps = {
  client: RedisClientLike;
  prefix: string;
};

export const createRedisLayer = ({
  client,
  prefix = '',
}: RedisLayerProps): PersistenceLayerApi => ({
  get: async ({ key }) => {
    const strEntry = await client.get(prefix + key);
    if (typeof strEntry !== 'string') {
      return;
    }
    const entry = JSON.parse(strEntry);
    // TODO: validate
    return entry;
  },
  set: ({ key, value }) => {
    client.set(prefix + key, JSON.stringify(value));
    return true; // TODO: check success of async operations
  },
  clear: () => {
    console.warn('fsLevel.clear: Not implemented yet...');
    return false;
  },
  delete: ({ key }) => {
    client.del(prefix + key);
    return true; // TODO: check success of async operations
  },
});
