import { NextSettings, PersistenceLevel } from '../index';
type RedisClient = {
    get: (key: string) => void | undefined | null | string | Promise<void | undefined | null | string>;
    set: (key: string, value: string) => any;
    del: (key: string) => any;
};
type RedisLevelProps = {
    client: RedisClient;
    prefix: string;
    next?: NextSettings;
};
export declare const createRedisLevel: ({ client, prefix, next, }: RedisLevelProps) => PersistenceLevel;
export {};
