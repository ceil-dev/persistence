import { PersistenceLayerApi } from '../index';
type FileSystemLayerProps = {
    fs: {
        readFileSync: (path: string) => Buffer;
        writeFileSync: (path: string, data: string, options?: {
            flag?: string;
        }) => void;
        unlinkSync: (path: string) => void;
    };
    folderPath?: string;
    prefix?: string;
};
export declare const createFileSystemLayer: ({ fs, prefix, folderPath, }: FileSystemLayerProps) => PersistenceLayerApi;
export {};
