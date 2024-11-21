import { PersistenceLevel, NextSettings, FetchLike } from '../index';

type RemoteStorageLevelProps = {
  endpoint: string;
  fetch: FetchLike;
  prefix: string;
  next?: NextSettings;
};

const SECRET = 'dnfio2e39jf239p4f2ji45f29p45fjn49';

export const createRemoteStorageLevel = ({
  endpoint,
  fetch,
  prefix = '',
  next,
}: RemoteStorageLevelProps): PersistenceLevel => {
  const _fetch = ({
    action,
    key,
    value,
  }: {
    action: string;
    key?: string;
    value?: unknown;
  }) =>
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        action,
        key: prefix + key,
        value,
        secret: SECRET,
      }),
    });

  return {
    get: async ({ key }) => {
      const strEntry = await (
        await _fetch({
          action: 'get',
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
    set: ({ key, value }) => {
      _fetch({ action: 'put', key, value: JSON.stringify(value) });
    },
    clear: () => {
      _fetch({ action: 'clear' });
    },
    delete: ({ key }) => {
      _fetch({ action: 'delete', key });
    },
    next,
  };
};
