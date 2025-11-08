export type StorageEntry = {
    version?: number;
    value: unknown;
};
export type PersistenceStorageGetProps = {
    key: string;
    path?: Depth[];
};
export type PersistenceStorageSetProps<T = unknown> = {
    key: string;
    path?: Depth[];
    value: T;
    version?: number;
};
export type PersistenceStorageUpgradeProps = {
    key: string;
    path?: Depth[];
    from?: string;
    to: string;
};
export type PersistenceStorageDeletePros = {
    key: string;
    path?: string[];
};
export type GetReturn = StorageEntry | Promise<StorageEntry | undefined> | undefined;
export type PersistenceLayerApi = {
    get: (props: PersistenceStorageGetProps) => GetReturn;
    set: (props: PersistenceStorageSetProps<StorageEntry>) => boolean | Promise<boolean>;
    delete: (props: PersistenceStorageDeletePros) => Promise<boolean> | boolean;
    clear: () => Promise<boolean> | boolean;
    supportsPaths?: boolean;
};
export type PersistenceLayer = {
    id?: string;
    api: PersistenceLayerApi;
};
export type PersistenceApiMethodProps = {
    startLayerId?: string;
};
export type Depth = string | number | DepthDescriptor;
export type DepthDescriptor = {
    key: string | number;
    defaultValue?: unknown;
    merge?: [string, unknown][];
};
export type PersistenceApi = {
    get: (props: PersistenceStorageGetProps & PersistenceApiMethodProps) => GetReturn;
    set: (props: PersistenceStorageSetProps & PersistenceApiMethodProps) => boolean | Promise<boolean>;
    delete: (props: PersistenceStorageDeletePros & PersistenceApiMethodProps) => boolean | Promise<boolean>;
    clear: (props: PersistenceApiMethodProps & PersistenceApiMethodProps) => boolean | Promise<boolean>;
    upgrade: (props: PersistenceStorageUpgradeProps & PersistenceApiMethodProps) => boolean | Promise<boolean>;
    addLayer: (props: {
        id: string;
        layer: PersistenceLayerApi;
        after?: string;
    }) => void;
};
export type CreatePersistenceProps = {
    id: string;
    defaultData: Record<string, unknown>;
    layers: [PersistenceLayer, ...rest: PersistenceLayer[]];
};
export type StorageAwaitResolve = (value: StorageEntry) => void;
export type AwaitEntry = {
    promise: Promise<StorageEntry>;
    resolve: StorageAwaitResolve;
};
export type WebStorageLike = {
    getItem: (key: string) => string | Promise<string | null> | null | undefined;
    setItem: (key: string, value: string) => void | Promise<void>;
    removeItem: (key: string) => void | Promise<void>;
    clear: () => void | Promise<void>;
};
type FetchResponse = {
    url: string;
    type: string;
    status: number;
    statusText: string;
    headers: any;
    ok: boolean;
    json: () => unknown;
    text: () => unknown;
};
export type FetchLike = (url: string, init?: {
    method: string;
    body: string;
    keepalive?: boolean;
    redirect?: 'error';
    signal?: _AbortSignal;
}) => Promise<FetchResponse>;
type _AbortSignal = {
    aborted: boolean;
    onabort: (e: Event) => void;
    reason: undefined;
    throwIfAborted: () => void;
    addEventListener: <K extends keyof AbortSignalEventMap>(type: K, listener: (this: _AbortSignal, ev: AbortSignalEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions) => void;
    removeEventListener: <K extends keyof AbortSignalEventMap>(type: K, listener: (this: _AbortSignal, ev: AbortSignalEventMap[K]) => unknown, options?: boolean | EventListenerOptions) => void;
    dispatchEvent: (event: Event) => boolean;
    any: any;
};
export {};
