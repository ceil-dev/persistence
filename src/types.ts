export type StorageEntry = { version?: number; value: unknown };

export type PersistenceStorageGetProps = {
  key: string;
  path?: Depth[];
  minVersion?: number | 'next' | 'any';
  forwarded?: boolean;
};
export type PersistenceStorageSetProps<T = unknown> = {
  key: string;
  path?: Depth[];
  value: T;
  version?: number;
};
export type PersistenceStorageNextProps = {
  key: string;
  path?: Depth[];
  value: unknown;
  settings: NextSettings;
};
export type PersistenceStorageDeletePros = { key: string; maxVersion?: number };

export type PersistenceLevel = {
  get: (
    props: PersistenceStorageGetProps
  ) => StorageEntry | Promise<StorageEntry | undefined> | undefined;
  // TODO: consider returning boolean indicating success
  set: (
    props: PersistenceStorageSetProps<StorageEntry>
  ) => void | boolean | Promise<void | boolean>;
  delete: (props: PersistenceStorageDeletePros) => Promise<void> | void;
  clear: () => Promise<void> | void;
  keys?: string[];
  next?: NextSettings;
  supportsPaths?: boolean;
  // destroy?
};

export type NextSettings = {
  // Works only as a delay as the moment
  bufferMs?: number;
  level: string;
  exclude?: string[];
};

export type PersistenceApiMethodProps = {
  minLevel?: 'default' | string;
  next?: NextSettings;
};

export type Depth = string | number | DepthDescriptor;

export type DepthDescriptor = {
  key: string | number;
  defaultValue?: unknown;
  merge?: [string, unknown][];
};

export type PersistenceApi = {
  get: (
    props: PersistenceStorageGetProps & PersistenceApiMethodProps
  ) => StorageEntry | Promise<StorageEntry | undefined> | undefined;
  set: (
    props: PersistenceStorageSetProps & PersistenceApiMethodProps
  ) => void | true | Promise<void | true>;
  delete: (
    props: PersistenceStorageDeletePros & PersistenceApiMethodProps
  ) => void | Promise<void>;
  clear: (props?: PersistenceApiMethodProps) => void | Promise<void>;
  upgrade: (
    props: PersistenceStorageNextProps & PersistenceApiMethodProps
  ) => void | boolean | Promise<void | boolean>;
  addLevel: (props: {
    id: string;
    level: PersistenceLevel;
    from?: string;
    bufferMs?: number;
  }) => void;
};

export type Persistence = { default: PersistenceLevel } & Record<
  string,
  PersistenceLevel | undefined
>;

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
export type FetchLike = (
  url: string,
  init?: {
    method: string;
    body: string;
    keepalive?: boolean;
    redirect?: 'error';
    signal?: _AbortSignal;
  }
) => Promise<FetchResponse>;

type _AbortSignal = {
  aborted: boolean;
  onabort: (e: Event) => void;
  reason: undefined;
  throwIfAborted: () => void;
  addEventListener: <K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: _AbortSignal, ev: AbortSignalEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ) => void;
  removeEventListener: <K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: _AbortSignal, ev: AbortSignalEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ) => void;
  // any: (signals: Iterable<_AbortSignal>) => _AbortSignal;
  dispatchEvent: (event: Event) => boolean;
  any: any;
};
