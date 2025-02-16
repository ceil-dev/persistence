import { PersistenceLevel } from '../index';

type Redislient = {
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

type RedisLevelProps = {
  client: Redislient;
  prefix: string;
};

export const createRedisLevel = ({
  client,
  prefix = '',
}: RedisLevelProps): PersistenceLevel => ({
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
    return client.set(prefix + key, JSON.stringify(value));
  },
  clear: () => {
    // return kv.clear();
  },
  delete: ({ key }) => {
    return client.del(prefix + key);
  },
});
