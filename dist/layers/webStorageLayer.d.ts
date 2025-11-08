import { PersistenceLayerApi, WebStorageLike } from '../index';
type WebStorageLayerProps = {
    webStorage: WebStorageLike;
    prefix: string;
};
export declare const createWebStorageLayer: ({ webStorage, prefix, }: WebStorageLayerProps) => PersistenceLayerApi;
export {};
