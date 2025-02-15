"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
let fs;
if (typeof window === 'undefined') {
    fs = require('fs');
}
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    fs.mkdirSync('./tmp/', { recursive: true });
    const persistence = (0, index_1.createPersistence)({
        defaultData: {
            firstKey: 419,
        },
        id: 'test',
        levels: {
            default: (0, index_1.createRuntimeLevel)({ next: { level: 'fs' } }),
            fs: (0, index_1.createFileSystemLevel)({ fs, folderPath: './tmp/', prefix: 'fs_' }),
        },
    });
    const testValue = (_a = (yield persistence.get({ key: 'firstKey' }))) === null || _a === void 0 ? void 0 : _a.value;
    if (typeof testValue !== 'number') {
        throw new Error("Invalid value for key 'firstKey'");
    }
    console.log(`Last known value of "firstKey": ${testValue}`);
    yield persistence.set({ key: 'firstKey', value: testValue + 1 });
    console.log(`Updated value of "firstKey": ${(_b = (yield persistence.get({ key: 'firstKey' }))) === null || _b === void 0 ? void 0 : _b.value}`);
    yield persistence.set({
        key: 'testObj',
        value: { existingProp: 'hello' },
    });
    yield persistence.set({
        key: 'testObj',
        path: [{ key: 'newProp', defaultValue: [] }, 0],
        value: 'world',
    });
    console.log('testObj value:', (_c = (yield persistence.get({
        key: 'testObj',
    }))) === null || _c === void 0 ? void 0 : _c.value);
});
run().catch(console.error);
//# sourceMappingURL=example.js.map