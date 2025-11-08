import { PersistenceLayerApi, StorageEntry } from '..';
export declare const createRuntimeLayer: (props?: {
    defaultData?: Record<string, StorageEntry>;
    prefix?: string;
}) => PersistenceLayerApi;
