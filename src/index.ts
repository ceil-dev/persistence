import {
  AwaitEntry,
  CreatePersistenceProps,
  Depth,
  GetReturn,
  PersistenceApi,
  StorageAwaitResolve,
  StorageEntry,
} from './types';

import { createRuntimeLayer } from './layers/runtimeLayer';
import path = require('path');

export * from './types';

export const getDeep = (data: unknown, path: Depth[]): unknown | undefined => {
  let value = data;
  for (const depth of path) {
    if (value === undefined || value === null) return;

    if (typeof depth === 'object') {
      value = value[depth.key] ??= Array.isArray(depth.defaultValue)
        ? [...depth.defaultValue]
        : !depth.defaultValue
          ? depth.defaultValue
          : typeof depth.defaultValue === 'object'
            ? { ...depth.defaultValue }
            : depth.defaultValue;
      if ((value ?? undefined) !== undefined) {
        depth.merge?.forEach(([k, v]) => ((value as any)[k] = v)); // will try to set any property on any value (for instance, will work with someArray.length)
      }
    } else {
      value = value[depth];
    }
  }
  return value;
};

export const setDeep = (
  data: unknown,
  path: Depth[],
  value: unknown
): boolean => {
  // TODO: Make sure that it works with depth descriptors
  const parentValue = getDeep(data, path.slice(0, -1));
  if (parentValue === undefined || parentValue === null) return false;
  const lastKey = path[path.length - 1];
  if (typeof lastKey === 'object') {
    parentValue[lastKey.key] = value ?? lastKey.defaultValue;
  } else {
    parentValue[lastKey] = value;
  }

  return true;
};

const maybePromise = <TValue, TReturn>(
  value: undefined | TValue | Promise<TValue | undefined>,
  forward: (value?: TValue) => TReturn | Promise<TReturn>
) => {
  return value instanceof Promise ? value.then(forward) : forward(value);
};

export const createPersistence = (mainProps: CreatePersistenceProps) => {
  let idIndex = 0;
  const genId = () => 'id' + idIndex++;
  const layers = mainProps.layers.map((l) => ({ id: genId(), ...l }));

  const awaits: Record<string, AwaitEntry> = {};

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
    get: ({ startLayerId, path, key }) => {
      const startLayerIndex = startLayerId
        ? layers.findIndex((l) => l.id === startLayerId)
        : 0;

      const currentLayer = layers[startLayerIndex];
      const nextLayer = layers[startLayerIndex + 1];

      if (!currentLayer)
        throw new Error(`Could not find layer with "${startLayerId}" id`);

      const isExpectedCurrentValueDeep =
        !!path?.length && !!currentLayer.api.supportsPaths;

      const value = currentLayer.api.get(
        isExpectedCurrentValueDeep ? { path, key } : { key }
      );

      return maybePromise(value, (getResult?: StorageEntry): GetReturn => {
        if (!getResult) {
          if (!nextLayer) return;

          const isNextValueDeep =
            !!path?.length &&
            !!currentLayer.api.supportsPaths &&
            !!nextLayer.api.supportsPaths;

          const nextLayerValue = api.get({
            startLayerId: nextLayer.id,
            path: isNextValueDeep ? path : undefined,
            key,
          });

          return maybePromise(
            nextLayerValue,
            (nextGetResult?: StorageEntry): GetReturn => {
              if (!nextGetResult) return;

              if (isNextValueDeep) {
                currentLayer.api.set({ key, path, value: nextGetResult });
                return nextGetResult;
              } else {
                if (!path?.length) {
                  currentLayer.api.set({ key, value: nextGetResult });
                  return nextGetResult;
                } else if (currentLayer.api.supportsPaths) {
                  const val = { value: getDeep(nextGetResult.value, path) };
                  currentLayer.api.set({ key, path, value: val });
                  return val;
                }
              }
            }
          );
        }

        if (path?.length && !isExpectedCurrentValueDeep) {
          return { value: getDeep(getResult.value, path) };
        }

        return getResult;
      });
    },

    set: ({ startLayerId, key, path, value }) => {
      const startLayerIndex = startLayerId
        ? layers.findIndex((l) => l.id === startLayerId)
        : 0;

      const currentLayer = layers[startLayerIndex];
      const nextLayer = layers[startLayerIndex + 1];

      const handleCurrentSet = (setRes?: boolean) => {
        if (!nextLayer) return setRes!;

        return api.set({
          startLayerId: nextLayer.id,
          key,
          path,
          value,
        });
      };

      if (path?.length && !currentLayer.api.supportsPaths) {
        const handleCurrentGetValue = (v?: StorageEntry) => {
          if (!v) return false;

          setDeep(v.value, path, value); // TODO: take care of mutability 🙈
          currentLayer.api.set({ key, value: v });

          if (!nextLayer) return true;

          return api.set({
            startLayerId: nextLayer.id,
            key,
            path,
            value,
          });
        };
        const currentGetValue = currentLayer.api.get({ key });
        return maybePromise(currentGetValue, handleCurrentGetValue);
      }

      const currentSetRes = currentLayer.api.set({
        key,
        path,
        value: { value },
      });

      return maybePromise(currentSetRes, handleCurrentSet);
    },

    // TODO: support paths
    delete: ({ startLayerId, key, path }) => {
      const startLayerIndex = startLayerId
        ? layers.findIndex((l) => l.id === startLayerId)
        : 0;

      const currentLayer = layers[startLayerIndex];
      const nextLayer = layers[startLayerIndex + 1];

      if (path?.length && !currentLayer.api.supportsPaths) {
        const currentValue = api.get({ startLayerId: currentLayer.id, key });
        return maybePromise(currentValue, (v) => {
          if (v === undefined) return false;

          const cv = getDeep(v.value, path.slice(0, -1));
          if (!cv) return false;
          if (Array.isArray(cv)) {
            const index = path.slice(-1)[0];
            // TODO: support numbers for keys
            if (!Number.isInteger(Number(index))) {
              return false;
            }
            cv.splice(Number(index), 1);
          } else if (typeof cv !== 'object') {
            delete cv[path.slice(-1)[0]];
          } else {
            return false;
          }

          return maybePromise(
            currentLayer.api.set({ key, value: v }),
            //
            (res) => {
              if (!res || !nextLayer) return false;
              return api.delete({ startLayerId: nextLayer.id, key, path });
            }
          );
        });
      }

      const currentRes = currentLayer.api.delete({ key, path });
      return maybePromise(currentRes, (v) => {
        if (v === false) return false;
        return api.delete({ startLayerId: nextLayer.id, key, path });
      });
    },

    clear: ({ startLayerId }) => {
      const startLayerIndex = startLayerId
        ? layers.findIndex((l) => l.id === startLayerId)
        : 0;

      const currentLayer = layers[startLayerIndex];
      const nextLayer = layers[startLayerIndex + 1];

      const currentRes = currentLayer.api.clear();
      return maybePromise(currentRes, (v) => {
        if (v === false) return false;
        return api.clear({ startLayerId: nextLayer.id });
      });
    },

    upgrade: ({ key, path, from, to }) => {
      // TODO: implement
      console.warn('"upgrade" method is not implemented yet');
      return false;
    },

    addLayer: ({ id, layer, after }) => {
      // TODO: implement
      console.warn('"addLayer" method is not implemented yet');
    },
  };

  return api;
};

export const createPersistenceSupplier = (props: CreatePersistenceProps) => {
  const api = createPersistence(props);

  return () => api;
};

export * from './layers/runtimeLayer';
export * from './layers/webStorageLayer';
export * from './layers/remoteStorageLayer';
export * from './layers/fileSystemLayer';
export * from './layers/redisLayer';
export * from './types';
