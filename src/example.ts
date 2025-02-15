import {
  createPersistence,
  createRuntimeLevel,
  createFileSystemLevel,
} from './index';

let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}

// This example uses two persistence levels: default and file system
const run = async () => {
  // Create a directory if it does not exist
  fs.mkdirSync('./tmp/', { recursive: true });

  const persistence = createPersistence({
    // If file does not exist, defaultData will be used
    defaultData: {
      firstKey: 419,
    },
    id: 'test',
    levels: {
      default: createRuntimeLevel({ next: { level: 'fs' } }), // Specifying file system level as the next level after default
      fs: createFileSystemLevel({ fs, folderPath: './tmp/', prefix: 'fs_' }),
    },
  });

  const testValue = (await persistence.get({ key: 'firstKey' }))?.value;

  if (typeof testValue !== 'number') {
    throw new Error("Invalid value for key 'firstKey'");
  }

  console.log(`Last known value of "firstKey": ${testValue}`);
  // Setting a new value for the key
  await persistence.set({ key: 'firstKey', value: testValue + 1 });
  console.log(
    `Updated value of "firstKey": ${(await persistence.get({ key: 'firstKey' }))?.value}`
  );

  // Setting test object
  await persistence.set({
    key: 'testObj',
    value: { existingProp: 'hello' },
  });

  // Setting nested prop on test object
  await persistence.set({
    key: 'testObj',
    path: [{ key: 'newProp', defaultValue: [] }, 0], // = testObj.newProp[0] - newProp will be set to [] if undefined | null
    value: 'world',
  });

  console.log(
    'testObj value:',
    (
      await persistence.get({
        key: 'testObj',
      })
    )?.value
  );
};

run().catch(console.error);
