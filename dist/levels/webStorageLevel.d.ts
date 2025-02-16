import { NextSettings, PersistenceLevel, WebStorageLike } from '../index';
type WebStorageLevelProps = {
    webStorage: WebStorageLike;
    prefix: string;
    next?: NextSettings;
};
export declare const createWebStorageLevel: ({ webStorage, prefix, next, }: WebStorageLevelProps) => PersistenceLevel;
export {};
