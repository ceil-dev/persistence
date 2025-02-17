import { PersistenceLevel, NextSettings } from '../index';

type FileSystemLevelProps = {
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
  next?: NextSettings;
};

export const createFileSystemLevel = ({
  fs,
  prefix = '',
  folderPath = './',
  next,
}: FileSystemLevelProps): PersistenceLevel => ({
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
      return fs.writeFileSync(
        folderPath + prefix + key,
        JSON.stringify(value, null, 2),
        {
          flag: 'w',
        }
      );
    } catch (e) {
      console.warn(
        `fsLevel: Setting "${key}" failed with:\n `,
        e?.['message'] || e
      );
      return;
    }
  },
  clear: () => {
    console.warn('fsLevel.clear: Not implemented yet...');
  },
  delete: ({ key }) => {
    try {
      return fs.unlinkSync(folderPath + prefix + key);
    } catch (e) {
      console.warn(
        `fsLevel: Deleting "${key}" failed with:\n `,
        e?.['message'] || e
      );
    }
  },
  next: next,
});
