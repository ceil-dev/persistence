"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPersistenceSupplier = exports.createPersistence = exports.setDeep = exports.getDeep = void 0;
const runtimeLevel_1 = require("./levels/runtimeLevel");
__exportStar(require("./types"), exports);
const getDeep = (data, path) => {
    let value = data;
    for (const key of path) {
        if (value === undefined || value === null)
            break;
        value = value[key];
    }
    return { value };
};
exports.getDeep = getDeep;
const setDeep = (data, path, value) => {
    const parentValue = (0, exports.getDeep)(data, path.slice(0, -1));
    if (parentValue.value === undefined || parentValue.value === null)
        return;
    parentValue.value[path[path.length - 1]] = value;
};
exports.setDeep = setDeep;
const createPersistence = (mainProps) => {
    var _a;
    const persistence = Object.assign(Object.assign({}, mainProps.levels), { default: ((_a = mainProps.levels) === null || _a === void 0 ? void 0 : _a.default) || (0, runtimeLevel_1.createRuntimeLevel)() });
    const awaits = {};
    const throttles = {};
    const getAwaiter = (key) => (awaits[key] || (awaits[key] = (() => {
        let resolve;
        const promise = new Promise((res) => {
            resolve = res;
        });
        return {
            promise,
            resolve,
        };
    })()));
    const api = {
        get: (_a) => __awaiter(void 0, void 0, void 0, function* () {
            var { minLevel = 'default' } = _a, props = __rest(_a, ["minLevel"]);
            const levelApi = persistence[minLevel];
            if (!levelApi)
                throw new Error(`Persistence: get called with unknown minLevel "${minLevel}"`);
            if (props.minVersion === 'next') {
                return getAwaiter(props.key).promise;
            }
            const nextSettings = props.next || levelApi.next;
            if (levelApi.keys && !levelApi.keys.includes(props.key)) {
                if (!(nextSettings === null || nextSettings === void 0 ? void 0 : nextSettings.level))
                    return;
                return api.get({ minLevel: nextSettings.level, key: props.key });
            }
            let entry = yield levelApi.get(props);
            if (!entry) {
                if (nextSettings) {
                    entry = yield (api === null || api === void 0 ? void 0 : api.get({
                        key: props.key,
                        minLevel: nextSettings.level,
                        forwarded: true,
                    }));
                    if (entry)
                        yield levelApi.set({ key: props.key, value: entry });
                }
            }
            if (!entry && props.key in mainProps.defaultData) {
                entry = { value: mainProps.defaultData[props.key] };
                persistence.default.set({ key: props.key, value: entry });
            }
            if (!entry && props.minVersion === 'any') {
                return getAwaiter(props.key).promise;
            }
            return entry;
        }),
        set: (_a) => __awaiter(void 0, void 0, void 0, function* () {
            var _b, _c;
            var { minLevel = 'default' } = _a, props = __rest(_a, ["minLevel"]);
            const levelApi = persistence[minLevel];
            if (!levelApi)
                throw new Error(`Persistence: set called with unknown minLevel "${minLevel}"`);
            const nextSettings = props.next || levelApi.next;
            if (levelApi.keys && !levelApi.keys.includes(props.key)) {
                if (!(nextSettings === null || nextSettings === void 0 ? void 0 : nextSettings.level))
                    return;
                return api.set({
                    minLevel: nextSettings === null || nextSettings === void 0 ? void 0 : nextSettings.level,
                    key: props.key,
                    value: props.value,
                });
            }
            yield levelApi.set(Object.assign(Object.assign({}, props), { value: { value: props.value } }));
            if (minLevel === 'default') {
                const awaitResolve = (_b = awaits[props.key]) === null || _b === void 0 ? void 0 : _b.resolve;
                delete awaits[props.key];
                awaitResolve === null || awaitResolve === void 0 ? void 0 : awaitResolve({ value: props.value });
            }
            if (nextSettings && !((_c = nextSettings.exclude) === null || _c === void 0 ? void 0 : _c.includes(props.key))) {
                yield api.upgrade({
                    key: props.key,
                    value: props.value,
                    settings: nextSettings,
                });
            }
            return;
        }),
        delete: (_a) => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            var { minLevel = 'default' } = _a, props = __rest(_a, ["minLevel"]);
            const levelApi = persistence[minLevel];
            if (!levelApi)
                throw new Error(`Persistence: delete called with unknown minLevel "${minLevel}"`);
            yield levelApi.delete(props);
            const nextSettings = props.next || levelApi.next;
            if (nextSettings && !((_b = nextSettings.exclude) === null || _b === void 0 ? void 0 : _b.includes(props.key))) {
                yield api.delete({
                    key: props.key,
                    minLevel: nextSettings.level,
                });
            }
            return;
        }),
        clear: (props) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const minLevel = (props === null || props === void 0 ? void 0 : props.minLevel) || 'default';
            const level = persistence[minLevel];
            if (!level)
                throw new Error(`Persistence: clear called with unknown minLevel "${minLevel}"`);
            yield level.clear();
            const nextLevel = ((_a = props === null || props === void 0 ? void 0 : props.next) === null || _a === void 0 ? void 0 : _a.level) || ((_b = level.next) === null || _b === void 0 ? void 0 : _b.level);
            if (nextLevel) {
                yield api.clear({ minLevel: nextLevel });
            }
            return;
        }),
        upgrade: ({ key, value, settings }) => {
            const { level: nextLevel, bufferMs } = settings;
            const level = persistence[nextLevel];
            if (!level)
                throw new Error(`Persistence: Tried to upgrade "${key}" to unknown level "${nextLevel}"`);
            let result;
            const up = () => {
                const setRes = api.set({
                    key,
                    value,
                    minLevel: nextLevel,
                });
                return setRes;
            };
            if (bufferMs !== undefined) {
                result = new Promise((resolve) => {
                    const throttleKey = key + '>' + nextLevel;
                    clearTimeout(throttles[throttleKey]);
                    throttles[throttleKey] = setTimeout(() => {
                        resolve(!!up());
                    }, bufferMs);
                });
            }
            else {
                result = !!up();
            }
            return result;
        },
        addLevel: ({ id, level, from, bufferMs }) => {
            persistence[id] = level;
            if (!from)
                return;
            const fromLevel = persistence[from];
            if (fromLevel) {
                const fromLevelNext = fromLevel.next;
                fromLevel.next = { level: id, bufferMs };
                level.next = fromLevelNext;
            }
        },
    };
    return api;
};
exports.createPersistence = createPersistence;
const createPersistenceSupplier = (props) => {
    const api = (0, exports.createPersistence)(props);
    return () => api;
};
exports.createPersistenceSupplier = createPersistenceSupplier;
__exportStar(require("./levels/runtimeLevel"), exports);
__exportStar(require("./levels/webStorageLevel"), exports);
__exportStar(require("./levels/remoteStorageLevel"), exports);
__exportStar(require("./levels/fileSystemLevel"), exports);
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map