import { PersistenceLevel, WebStorageLike } from '../index';
type WebStorageLevelProps = {
    webStorage: WebStorageLike;
    prefix: string;
};
export declare const createWebStorageLevel: ({ webStorage, prefix, }: WebStorageLevelProps) => PersistenceLevel;
export {};
