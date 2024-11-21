import { PersistenceLevel, StorageEntry, NextSettings } from '../';
export declare const createRuntimeLevel: (props?: {
    next?: NextSettings;
    defaultData?: Record<string, StorageEntry>;
    prefix?: string;
}) => PersistenceLevel;
