import { PersistenceLayerApi } from '../index';

type FileSystemLayerProps = {
  fs: {
    readFileSync: (path: string) => Buffer;
    writeFileSync: (
      path: string,
      data: string,
      options?: {
        flag?: string;
      }
    ) => void;
    unlinkSync: (path: string) => void;
  };
  folderPath?: string;
  prefix?: string;
};

export const createFileSystemLayer = ({
  fs,
  prefix = '',
  folderPath = './',
}: FileSystemLayerProps): PersistenceLayerApi => ({
  get: async ({ key }) => {
    try {
      const strEntry = fs.readFileSync(folderPath + prefix + key).toString();
      const entry = JSON.parse(strEntry);
      // TODO: validate
      return entry;
    } catch (e) {
      // TODO: destiguish between simple "not set yet" and other
      return;
    }
  },
  set: ({ key, value }) => {
    try {
      fs.writeFileSync(
        folderPath + prefix + key,
        JSON.stringify(value, null, 2),
        {
          flag: 'w',
        }
      );
      return true;
    } catch (e) {
      console.warn(
        `fsLevel: Setting "${key}" failed with:\n `,
        e?.['message'] || e
      );
    }
    return false;
  },
  clear: () => {
    console.warn('fsLevel.clear: Not implemented yet...');
    return false;
  },
  delete: ({ key }) => {
    try {
      fs.unlinkSync(folderPath + prefix + key);
      return true;
    } catch (e) {
      console.warn(
        `fsLevel: Deleting "${key}" failed with:\n `,
        e?.['message'] || e
      );
    }
    return false;
  },
});
