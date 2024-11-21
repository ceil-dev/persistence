import {
  AwaitEntry,
  CreatePersistenceProps,
  Persistence,
  PersistenceApi,
  PersistenceStorageNextProps,
  StorageAwaitResolve,
  StorageEntry,
} from './types';

import { createRuntimeLevel } from './levels/runtimeLevel';

export * from './types';

export const getDeep = (data: unknown, path: string[]): StorageEntry => {
  let value = data;
  for (const key of path) {
    if (value === undefined || value === null) break;
    value = value[key];
  }
  return { value };
};

export const setDeep = (
  data: unknown,
  path: string[],
  value: unknown
): void => {
  const parentValue = getDeep(data, path.slice(0, -1));
  if (parentValue.value === undefined || parentValue.value === null) return;
  parentValue.value[path[path.length - 1]] = value;
};

export const createPersistence = (mainProps: CreatePersistenceProps) => {
  const persistence: Persistence = {
    ...mainProps.levels,
    default: mainProps.levels?.default || createRuntimeLevel(),
  };

  const awaits: Record<string, AwaitEntry> = {};

  const throttles: Record<string, NodeJS.Timeout> = {};

  const getAwaiter = (key: string) =>
    (awaits[key] ||= (() => {
      let resolve: StorageAwaitResolve;
      const promise = new Promise<StorageEntry>((res) => {
        resolve = res;
      });
      return {
        promise,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resolve,
      };
    })());

  const api: PersistenceApi = {
    get: async ({ minLevel = 'default', ...props }) => {
      const levelApi = persistence[minLevel];

      if (!levelApi)
        throw new Error(
          `Persistence: get called with unknown minLevel "${minLevel}"`
        );

      if (props.minVersion === 'next') {
        return getAwaiter(props.key).promise;
      }

      const nextSettings = props.next || levelApi.next;

      if (levelApi.keys && !levelApi.keys.includes(props.key)) {
        if (!nextSettings?.level) return;

        return api.get({ minLevel: nextSettings.level, key: props.key });
      }

      let entry = await levelApi.get(props);

      if (!entry) {
        // No data -> trying to get it from higher persistence level
        if (nextSettings) {
          // Next level info indicates that there's a higher level -> can try getting value from there
          entry = await api?.get({
            key: props.key,
            minLevel: nextSettings.level,
            forwarded: true,
          });

          // Settings lower level value so next time there'll be no need to access higher level          }
          if (entry) await levelApi.set({ key: props.key, value: entry });
        }
      }

      if (!entry && props.key in mainProps.defaultData) {
        entry = { value: mainProps.defaultData[props.key] };
        persistence.default.set({ key: props.key, value: entry });
      }

      if (!entry && props.minVersion === 'any') {
        return getAwaiter(props.key).promise;
      }

      return entry;
    },

    set: async ({ minLevel = 'default', ...props }) => {
      const levelApi = persistence[minLevel];
      if (!levelApi)
        throw new Error(
          `Persistence: set called with unknown minLevel "${minLevel}"`
        );

      const nextSettings = props.next || levelApi.next;

      if (levelApi.keys && !levelApi.keys.includes(props.key)) {
        if (!nextSettings?.level) return;

        return api.set({
          minLevel: nextSettings?.level,
          key: props.key,
          value: props.value,
        });
      }

      await levelApi.set({
        ...props,
        value: { value: props.value },
      });

      if (minLevel === 'default') {
        const awaitResolve = awaits[props.key]?.resolve;
        delete awaits[props.key];
        awaitResolve?.({ value: props.value });
      }

      if (nextSettings && !nextSettings.exclude?.includes(props.key)) {
        await api.upgrade({
          key: props.key,
          value: props.value,
          settings: nextSettings,
        });
      }

      return;
    },

    delete: async ({ minLevel = 'default', ...props }) => {
      const levelApi = persistence[minLevel];
      if (!levelApi)
        throw new Error(
          `Persistence: delete called with unknown minLevel "${minLevel}"`
        );

      await levelApi.delete(props);

      const nextSettings = props.next || levelApi.next;

      if (nextSettings && !nextSettings.exclude?.includes(props.key)) {
        await api.delete({
          key: props.key,
          minLevel: nextSettings.level,
        });
      }

      return;
    },

    clear: async (props) => {
      const minLevel = props?.minLevel || 'default';
      const level = persistence[minLevel];
      if (!level)
        throw new Error(
          `Persistence: clear called with unknown minLevel "${minLevel}"`
        );

      await level.clear();

      const nextLevel = props?.next?.level || level.next?.level;

      if (nextLevel) {
        await api.clear({ minLevel: nextLevel });
      }

      return;
    },

    upgrade: ({ key, value, settings }: PersistenceStorageNextProps) => {
      const { level: nextLevel, bufferMs } = settings;

      const level = persistence[nextLevel];
      if (!level)
        throw new Error(
          `Persistence: Tried to upgrade "${key}" to unknown level "${nextLevel}"`
        );

      let result: boolean | Promise<boolean> | undefined;

      const up = () => {
        const setRes = api.set({
          key,
          value,
          minLevel: nextLevel,
        });
        return setRes;
      };

      if (bufferMs !== undefined) {
        result = new Promise((resolve) => {
          const throttleKey = key + '>' + nextLevel;
          clearTimeout(throttles[throttleKey]);
          throttles[throttleKey] = setTimeout(() => {
            resolve(!!up());
          }, bufferMs);
        });
      } else {
        result = !!up();
      }

      return result;
    },
    addLevel: ({ id, level, from, bufferMs }) => {
      persistence[id] = level;
      if (!from) return;

      const fromLevel = persistence[from];
      if (fromLevel) {
        const fromLevelNext = fromLevel.next;
        fromLevel.next = { level: id, bufferMs };
        level.next = fromLevelNext;
      }
    },
  };

  return api;
};

export const createPersistenceSupplier = (props: CreatePersistenceProps) => {
  const api = createPersistence(props);

  return () => api;
};

export * from './levels/runtimeLevel';
export * from './levels/webStorageLevel';
export * from './levels/remoteStorageLevel';
export * from './levels/fileSystemLevel';
export * from './types';
