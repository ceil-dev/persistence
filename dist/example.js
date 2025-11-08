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
const tmpDir = './tmp/';
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    fs.mkdirSync(tmpDir, { recursive: true });
    console.log('\n=== Persistence Example ===');
    const persistence = (0, index_1.createPersistence)({
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
            { api: (0, index_1.createRuntimeLayer)() },
            { api: (0, index_1.createFileSystemLayer)({ fs, folderPath: tmpDir, prefix: 'fs_' }) },
        ],
    });
    console.log('Restored firstKey after restart:', (_a = (yield persistence.get({ key: 'firstKey' }))) === null || _a === void 0 ? void 0 : _a.value);
    console.log('Restored userProfile after restart:', (_b = (yield persistence.get({ key: 'userProfile' }))) === null || _b === void 0 ? void 0 : _b.value);
    console.log('Restored todos after restart:', (_c = (yield persistence.get({ key: 'todos' }))) === null || _c === void 0 ? void 0 : _c.value);
    const firstValue = (_e = (_d = (yield persistence.get({ key: 'firstKey' }))) === null || _d === void 0 ? void 0 : _d.value) !== null && _e !== void 0 ? _e : 0;
    console.log(`Initial firstKey value: ${firstValue}`);
    if (typeof firstValue !== 'number') {
        throw new Error(`firstValue in not number. "${typeof firstValue}" instead`);
    }
    yield persistence.set({ key: 'firstKey', value: firstValue + 1 });
    console.log(`Updated firstKey value: ${(_f = (yield persistence.get({ key: 'firstKey' }))) === null || _f === void 0 ? void 0 : _f.value}`);
    console.log('\n--- User Profile ---');
    const initialProfile = yield persistence.get({ key: 'userProfile' });
    console.log('Initial profile:', initialProfile === null || initialProfile === void 0 ? void 0 : initialProfile.value);
    if (!initialProfile) {
        console.log('Initial profile is undefined. Setting as an empty object');
        yield persistence.set({
            key: 'userProfile',
            value: {},
        });
    }
    yield persistence.set({
        key: 'userProfile',
        path: ['stats', 'xp'],
        value: 150,
    });
    yield persistence.set({
        key: 'userProfile',
        path: ['stats', 'level'],
        value: 2,
    });
    console.log('After XP + Level update:', (_g = (yield persistence.get({ key: 'userProfile' }))) === null || _g === void 0 ? void 0 : _g.value);
    yield persistence.set({
        key: 'userProfile',
        path: ['preferences'],
        value: { theme: 'dark', notifications: true },
    });
    yield persistence.set({
        key: 'userProfile',
        path: [{ key: 'preferences' }, 'fontSize'],
        value: 'medium',
    });
    console.log('After merging preferences:', (_h = (yield persistence.get({ key: 'userProfile' }))) === null || _h === void 0 ? void 0 : _h.value);
    console.log('\n--- Todo List ---');
    yield persistence.set({
        key: 'todos',
        value: [
            { id: 1, task: 'Write docs', done: false },
            { id: 2, task: 'Push to repo', done: false },
        ],
    });
    console.log('Todos:', (_j = (yield persistence.get({ key: 'todos' }))) === null || _j === void 0 ? void 0 : _j.value);
    yield persistence.set({
        key: 'todos',
        path: [2],
        value: { id: 3, task: 'Run tests', done: false },
    });
    console.log('After adding another todo:', (_k = (yield persistence.get({ key: 'todos' }))) === null || _k === void 0 ? void 0 : _k.value);
    yield persistence.set({
        key: 'todos',
        path: [1, 'done'],
        value: true,
    });
    console.log('After marking 2nd todo done:', (_l = (yield persistence.get({ key: 'todos' }))) === null || _l === void 0 ? void 0 : _l.value);
    console.log('\n--- Deletions ---');
    yield persistence.delete({ key: 'todos', path: ['0'] });
    console.log('After deleting first todo:', (_m = (yield persistence.get({ key: 'todos' }))) === null || _m === void 0 ? void 0 : _m.value);
    yield persistence.delete({
        key: 'userProfile',
        path: ['preferences', 'notifications'],
    });
    console.log('After removing notifications:', (_o = (yield persistence.get({ key: 'userProfile' }))) === null || _o === void 0 ? void 0 : _o.value);
    console.log('\n--- Batch scenario ---');
    yield Promise.all([
        persistence.set({ key: 'sessionToken', value: 'abc123' }),
        persistence.set({ key: 'appSettings', value: { language: 'en-US' } }),
    ]);
    console.log('App settings:', (_p = (yield persistence.get({ key: 'appSettings' }))) === null || _p === void 0 ? void 0 : _p.value);
    const logCount = (_r = (_q = (yield persistence.get({ key: 'logCount' }))) === null || _q === void 0 ? void 0 : _q.value) !== null && _r !== void 0 ? _r : 0;
    if (typeof logCount !== 'number') {
        throw new Error(`logCount in not number. "${typeof logCount}" instead`);
    }
    yield persistence.set({ key: 'logCount', value: logCount + 1 });
    console.log('Incremented logCount:', (_s = (yield persistence.get({ key: 'logCount' }))) === null || _s === void 0 ? void 0 : _s.value);
    console.log('\n=== Done ===');
});
run().catch(console.error);
//# sourceMappingURL=example.js.map