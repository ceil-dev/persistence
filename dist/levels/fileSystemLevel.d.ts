import { PersistenceLevel, NextSettings } from '../index';
type FileSystemLevelProps = {
    fs: {
        readFileSync: (path: string) => Buffer;
        writeFileSync: (path: string, data: string, options?: {
            flag?: string;
        }) => void;
        unlinkSync: (path: string) => void;
    };
    folderPath?: string;
    prefix?: string;
    next?: NextSettings;
};
export declare const createFileSystemLevel: ({ fs, prefix, folderPath, next, }: FileSystemLevelProps) => PersistenceLevel;
export {};
