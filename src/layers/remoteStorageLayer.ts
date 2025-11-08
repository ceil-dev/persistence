import { PersistenceLayerApi, FetchLike, Depth } from '../index';

type RemoteStorageLayerProps = {
  endpoint: string;
  fetch: FetchLike;
  secret?: string;
  prefix: string;
  supportsPaths?: boolean;
};

export const createRemoteStorageLayer = ({
  endpoint,
  fetch,
  secret = 'dnfio2e39jf239p4f2ji45f29p45fjn49', // temporary deafult secret
  prefix = '',
  supportsPaths, // if remote supports paths
}: RemoteStorageLayerProps): PersistenceLayerApi => {
  const _fetch = ({
    action,
    key,
    path,
    value,
  }: {
    action: string;
    key?: string;
    path?: Depth[];
    value?: unknown;
  }) =>
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        action,
        key: prefix + key,
        path: supportsPaths ? path : undefined,
        value,
        secret,
      }),
    });

  return {
    get: async ({ key, path }) => {
      const strEntry = await (
        await _fetch({
          action: 'get',
          path,
          key,
        })
      ).text();

      if (!strEntry || typeof strEntry !== 'string') {
        return;
      }

      const entry = JSON.parse(strEntry);
      // TODO: validate
      return entry;
    },
    set: async ({ key, value }) => {
      const res = await _fetch({
        action: 'put',
        key,
        value: JSON.stringify(value),
      });
      return res.ok;
    },
    clear: async () => {
      const res = await _fetch({ action: 'clear' });
      return res.ok;
    },
    delete: async ({ key }) => {
      const res = await _fetch({ action: 'delete', key });
      return res.ok;
    },
    supportsPaths,
  };
};
