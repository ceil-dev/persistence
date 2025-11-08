import { PersistenceLayerApi, FetchLike } from '../index';
type RemoteStorageLayerProps = {
    endpoint: string;
    fetch: FetchLike;
    secret?: string;
    prefix: string;
    supportsPaths?: boolean;
};
export declare const createRemoteStorageLayer: ({ endpoint, fetch, secret, prefix, supportsPaths, }: RemoteStorageLayerProps) => PersistenceLayerApi;
export {};
