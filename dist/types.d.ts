export type StorageEntry = {
    version?: number;
    value: unknown;
};
export type PersistenceStorageGetPros = {
    key: string;
    minVersion?: number | 'next' | 'any';
    forwarded?: boolean;
};
export type PersistenceStorageSetPros<T = unknown> = {
    key: string;
    value: T;
    version?: number;
};
export type PersistenceStorageNextProps = {
    key: string;
    value: unknown;
    settings: NextSettings;
};
export type PersistenceStorageDeletePros = {
    key: string;
    maxVersion?: number;
};
export type PersistenceLevel = {
    get: (props: PersistenceStorageGetPros) => StorageEntry | Promise<StorageEntry | undefined> | undefined;
    set: (props: PersistenceStorageSetPros<StorageEntry>) => void | Promise<void>;
    delete: (props: PersistenceStorageDeletePros) => Promise<void> | void;
    clear: () => Promise<void> | void;
    keys?: string[];
    next?: NextSettings;
};
export type NextSettings = {
    bufferMs?: number;
    level: string;
    exclude?: string[];
};
export type PersistenceApiMethodProps = {
    minLevel?: 'default' | string;
    next?: NextSettings;
};
export type PersistenceApi = {
    get: (props: PersistenceStorageGetPros & PersistenceApiMethodProps) => StorageEntry | Promise<StorageEntry | undefined> | undefined;
    set: (props: PersistenceStorageSetPros & PersistenceApiMethodProps) => void | Promise<void>;
    delete: (props: PersistenceStorageDeletePros & PersistenceApiMethodProps) => void | Promise<void>;
    clear: (props?: PersistenceApiMethodProps) => void | Promise<void>;
    upgrade: (props: PersistenceStorageNextProps & PersistenceApiMethodProps) => boolean | Promise<boolean>;
    addLevel: (props: {
        id: string;
        level: PersistenceLevel;
        from?: string;
        bufferMs?: number;
    }) => void;
};
export type Persistence = {
    default: PersistenceLevel;
} & Record<string, PersistenceLevel | undefined>;
export type CreatePersistenceProps = {
    id: string;
    defaultData: Record<string, unknown>;
    levels?: Record<'default' | string, PersistenceLevel>;
};
export type StorageAwaitResolve = (value: StorageEntry) => void;
export type AwaitEntry = {
    promise: Promise<StorageEntry>;
    resolve: StorageAwaitResolve;
};
export type WebStorageLike = {
    getItem: (key: string) => string | Promise<string> | null | undefined;
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
    onabort: ((e: Event) => unknown) | null;
    reason: undefined;
    throwIfAborted: () => void;
    addEventListener: <K extends keyof AbortSignalEventMap>(type: K, listener: (this: _AbortSignal, ev: AbortSignalEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions) => void;
    removeEventListener: <K extends keyof AbortSignalEventMap>(type: K, listener: (this: _AbortSignal, ev: AbortSignalEventMap[K]) => unknown, options?: boolean | EventListenerOptions) => void;
    dispatchEvent: (event: Event) => boolean;
    any: any;
};
export {};
