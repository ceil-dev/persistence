# Persistence Library

_Library for organizing redundancy_

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Example](#example)
5. [License](#license)

---

## Overview

The library serves as a straightforward interface for managing data storage across multiple levels, making it easier to handle data in systems with hierarchical structures. It simplifies the process of retrieving, updating, and deleting data, so you don’t have to worry about the intricate details of managing storage layers. Depending on availability or priority, data can be stored and accessed from different levels, offering flexibility in how information is managed and retrieved.

This approach streamlines storage operations, providing an efficient way to handle data in complex systems without dealing with the underlying complexity.

---

## Installation

```bash
# Clone the repository
npm install @ceil-dev/persistence
```

---

### Usage

```javascript
import {microEnv} from '@ceil-dev/persistence';
```

---

### Example

```typescript
import {
  createPersistence,
  createRuntimeLevel,
  createFileSystemLevel,
} from "@ceil-dev/persistence";
import fs from "fs";

// This example uses two persistence levels: default and file system
const run = async () => {
  // Create a directory if it does not exist
  fs.mkdirSync("./tmp/", { recursive: true });

  const persistence = createPersistence({
    // If file does not exist, defaultData will be used
    defaultData: {
      firstKey: 419,
    },
    id: "test",
    levels: {
      default: createRuntimeLevel({ next: { level: "fs" } }), // Specifying file system level as the next level after default
      fs: createFileSystemLevel({ fs, folderPath: "./tmp/", prefix: "fs_" }),
    },
  });

  const testValue = (await persistence.get({ key: "firstKey" }))?.value;

  if (typeof testValue !== "number") {
    throw new Error("Invalid value for key 'firstKey'");
  }

  console.log(`Last known value of "firstKey": ${testValue}`);
  // Setting a new value for the key
  await persistence.set({ key: "firstKey", value: testValue + 1 });
  console.log(`Updated value of "firstKey": ${testValue + 1}`);
};

run().catch(console.error);
```

---

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
