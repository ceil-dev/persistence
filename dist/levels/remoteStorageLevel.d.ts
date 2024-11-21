import { PersistenceLevel, NextSettings, FetchLike } from '../index';
type RemoteStorageLevelProps = {
    endpoint: string;
    fetch: FetchLike;
    prefix: string;
    next?: NextSettings;
};
export declare const createRemoteStorageLevel: ({ endpoint, fetch, prefix, next, }: RemoteStorageLevelProps) => PersistenceLevel;
export {};
