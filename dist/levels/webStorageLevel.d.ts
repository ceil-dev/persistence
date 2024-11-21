import { PersistenceLevel, WebStorageLike } from '../index';
type WebStorageLevelProps = Omit<Partial<PersistenceLevel>, 'get' | 'set' | 'delete' | 'clear'> & {
    webStorage: WebStorageLike;
    prefix: string;
};
export declare const createWebStorageLevel: ({ webStorage, prefix, ...rest }: WebStorageLevelProps) => PersistenceLevel;
export {};
