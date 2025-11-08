import {
  createPersistence,
  createRuntimeLayer,
  createFileSystemLayer,
} from './index';

let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}

const tmpDir = './tmp/';

const run = async () => {
  // Ensure tmp directory exists
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log('\n=== Persistence Example ===');

  const persistence = createPersistence({
    id: 'test',
    defaultData: {
      firstKey: 419,
      userProfile: {
        name: 'Anonymous',
        stats: { level: 1, xp: 0 },
      },
      todos: [],
    },
    layers: [
      { api: createRuntimeLayer() },
      { api: createFileSystemLayer({ fs, folderPath: tmpDir, prefix: 'fs_' }) },
    ],
  });

  console.log(
    'Restored firstKey after restart:',
    (await persistence.get({ key: 'firstKey' }))?.value
  );
  console.log(
    'Restored userProfile after restart:',
    (await persistence.get({ key: 'userProfile' }))?.value
  );
  console.log(
    'Restored todos after restart:',
    (await persistence.get({ key: 'todos' }))?.value
  );

  /** 1️⃣ Read existing persisted value */
  const firstValue = (await persistence.get({ key: 'firstKey' }))?.value ?? 0;
  console.log(`Initial firstKey value: ${firstValue}`);

  if (typeof firstValue !== 'number') {
    throw new Error(`firstValue in not number. "${typeof firstValue}" instead`);
  }

  /** 2️⃣ Increment stored numeric value */
  await persistence.set({ key: 'firstKey', value: firstValue + 1 });
  console.log(
    `Updated firstKey value: ${(await persistence.get({ key: 'firstKey' }))?.value}`
  );

  /** 3️⃣ Work with nested objects */
  console.log('\n--- User Profile ---');
  const initialProfile = await persistence.get({ key: 'userProfile' });
  console.log('Initial profile:', initialProfile?.value);

  if (!initialProfile) {
    console.log('Initial profile is undefined. Setting as an empty object');
    await persistence.set({
      key: 'userProfile',
      value: {},
    });
  }

  // Update nested values
  await persistence.set({
    key: 'userProfile',
    path: ['stats', 'xp'],
    value: 150,
  });

  await persistence.set({
    key: 'userProfile',
    path: ['stats', 'level'],
    value: 2,
  });

  console.log(
    'After XP + Level update:',
    (await persistence.get({ key: 'userProfile' }))?.value
  );

  /** 4️⃣ Merge nested properties dynamically */
  await persistence.set({
    key: 'userProfile',
    path: ['preferences'],
    value: { theme: 'dark', notifications: true },
  });

  await persistence.set({
    key: 'userProfile',
    path: [{ key: 'preferences' }, 'fontSize'],
    value: 'medium',
  });

  console.log(
    'After merging preferences:',
    (await persistence.get({ key: 'userProfile' }))?.value
  );

  /** 5️⃣ Simulate a list (todos) */
  console.log('\n--- Todo List ---');
  await persistence.set({
    key: 'todos',
    value: [
      { id: 1, task: 'Write docs', done: false },
      { id: 2, task: 'Push to repo', done: false },
    ],
  });

  console.log('Todos:', (await persistence.get({ key: 'todos' }))?.value);

  // Add another todo using path update
  await persistence.set({
    key: 'todos',
    path: [2],
    value: { id: 3, task: 'Run tests', done: false },
  });

  console.log(
    'After adding another todo:',
    (await persistence.get({ key: 'todos' }))?.value
  );

  // Update nested field inside an array element
  await persistence.set({
    key: 'todos',
    path: [1, 'done'],
    value: true,
  });

  console.log(
    'After marking 2nd todo done:',
    (await persistence.get({ key: 'todos' }))?.value
  );

  /** 6️⃣ Deletion examples */
  console.log('\n--- Deletions ---');
  await persistence.delete({ key: 'todos', path: ['0'] }); // remove first todo
  console.log(
    'After deleting first todo:',
    (await persistence.get({ key: 'todos' }))?.value
  );

  await persistence.delete({
    key: 'userProfile',
    path: ['preferences', 'notifications'],
  });
  console.log(
    'After removing notifications:',
    (await persistence.get({ key: 'userProfile' }))?.value
  );

  /** 7️⃣ Batch-like scenario: multiple writes */
  console.log('\n--- Batch scenario ---');
  await Promise.all([
    persistence.set({ key: 'sessionToken', value: 'abc123' }),
    persistence.set({ key: 'appSettings', value: { language: 'en-US' } }),
  ]);

  console.log(
    'App settings:',
    (await persistence.get({ key: 'appSettings' }))?.value
  );

  /** 8️⃣ Conditional update (read-modify-write pattern) */
  const logCount = (await persistence.get({ key: 'logCount' }))?.value ?? 0;
  if (typeof logCount !== 'number') {
    throw new Error(`logCount in not number. "${typeof logCount}" instead`);
  }
  await persistence.set({ key: 'logCount', value: logCount + 1 });
  console.log(
    'Incremented logCount:',
    (await persistence.get({ key: 'logCount' }))?.value
  );

  console.log('\n=== Done ===');
};

run().catch(console.error);
