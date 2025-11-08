import { PersistenceLayerApi } from '../index';
type RedisClientLike = {
    get: (key: string) => void | undefined | null | string | Promise<void | undefined | null | string>;
    set: (key: string, value: string) => any;
    del: (key: string) => any;
};
type RedisLayerProps = {
    client: RedisClientLike;
    prefix: string;
};
export declare const createRedisLayer: ({ client, prefix, }: RedisLayerProps) => PersistenceLayerApi;
export {};
