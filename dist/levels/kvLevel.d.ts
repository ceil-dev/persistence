import { PersistenceLevel } from '../index';
type KVClient = {
    get: (key: string) => void | undefined | null | string | Promise<void | undefined | null | string>;
    set: (key: string, value: string) => any;
    del: (key: string) => any;
};
type kvLevelProps = Omit<Partial<PersistenceLevel>, 'get' | 'set' | 'delete' | 'clear'> & {
    client: KVClient;
    prefix: string;
};
export declare const createKVLevel: ({ client, prefix, ...rest }: kvLevelProps) => PersistenceLevel;
export {};
