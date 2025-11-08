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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPersistenceSupplier = exports.createPersistence = exports.setDeep = exports.getDeep = void 0;
__exportStar(require("./types"), exports);
const getDeep = (data, path) => {
    var _a, _b;
    var _c;
    let value = data;
    for (const depth of path) {
        if (value === undefined || value === null)
            return;
        if (typeof depth === 'object') {
            value = (_a = value[_c = depth.key]) !== null && _a !== void 0 ? _a : (value[_c] = Array.isArray(depth.defaultValue)
                ? [...depth.defaultValue]
                : !depth.defaultValue
                    ? depth.defaultValue
                    : typeof depth.defaultValue === 'object'
                        ? Object.assign({}, depth.defaultValue) : depth.defaultValue);
            if ((value !== null && value !== void 0 ? value : undefined) !== undefined) {
                (_b = depth.merge) === null || _b === void 0 ? void 0 : _b.forEach(([k, v]) => (value[k] = v));
            }
        }
        else {
            value = value[depth];
        }
    }
    return value;
};
exports.getDeep = getDeep;
const setDeep = (data, path, value) => {
    const parentValue = (0, exports.getDeep)(data, path.slice(0, -1));
    if (parentValue === undefined || parentValue === null)
        return false;
    const lastKey = path[path.length - 1];
    if (typeof lastKey === 'object') {
        parentValue[lastKey.key] = value !== null && value !== void 0 ? value : lastKey.defaultValue;
    }
    else {
        parentValue[lastKey] = value;
    }
    return true;
};
exports.setDeep = setDeep;
const maybePromise = (value, forward) => {
    return value instanceof Promise ? value.then(forward) : forward(value);
};
const createPersistence = (mainProps) => {
    let idIndex = 0;
    const genId = () => 'id' + idIndex++;
    const layers = mainProps.layers.map((l) => (Object.assign({ id: genId() }, l)));
    const awaits = {};
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
        get: ({ startLayerId, path, key }) => {
            const startLayerIndex = startLayerId
                ? layers.findIndex((l) => l.id === startLayerId)
                : 0;
            const currentLayer = layers[startLayerIndex];
            const nextLayer = layers[startLayerIndex + 1];
            if (!currentLayer)
                throw new Error(`Could not find layer with "${startLayerId}" id`);
            const isExpectedCurrentValueDeep = !!(path === null || path === void 0 ? void 0 : path.length) && !!currentLayer.api.supportsPaths;
            const value = currentLayer.api.get(isExpectedCurrentValueDeep ? { path, key } : { key });
            return maybePromise(value, (getResult) => {
                if (!getResult) {
                    if (!nextLayer)
                        return;
                    const isNextValueDeep = !!(path === null || path === void 0 ? void 0 : path.length) &&
                        !!currentLayer.api.supportsPaths &&
                        !!nextLayer.api.supportsPaths;
                    const nextLayerValue = api.get({
                        startLayerId: nextLayer.id,
                        path: isNextValueDeep ? path : undefined,
                        key,
                    });
                    return maybePromise(nextLayerValue, (nextGetResult) => {
                        if (!nextGetResult)
                            return;
                        if (isNextValueDeep) {
                            currentLayer.api.set({ key, path, value: nextGetResult });
                            return nextGetResult;
                        }
                        else {
                            if (!(path === null || path === void 0 ? void 0 : path.length)) {
                                currentLayer.api.set({ key, value: nextGetResult });
                                return nextGetResult;
                            }
                            else if (currentLayer.api.supportsPaths) {
                                const val = { value: (0, exports.getDeep)(nextGetResult.value, path) };
                                currentLayer.api.set({ key, path, value: val });
                                return val;
                            }
                        }
                    });
                }
                if ((path === null || path === void 0 ? void 0 : path.length) && !isExpectedCurrentValueDeep) {
                    return { value: (0, exports.getDeep)(getResult.value, path) };
                }
                return getResult;
            });
        },
        set: ({ startLayerId, key, path, value }) => {
            const startLayerIndex = startLayerId
                ? layers.findIndex((l) => l.id === startLayerId)
                : 0;
            const currentLayer = layers[startLayerIndex];
            const nextLayer = layers[startLayerIndex + 1];
            const handleCurrentSet = (setRes) => {
                if (!nextLayer)
                    return setRes;
                return api.set({
                    startLayerId: nextLayer.id,
                    key,
                    path,
                    value,
                });
            };
            if ((path === null || path === void 0 ? void 0 : path.length) && !currentLayer.api.supportsPaths) {
                const handleCurrentGetValue = (v) => {
                    if (!v)
                        return false;
                    (0, exports.setDeep)(v.value, path, value);
                    currentLayer.api.set({ key, value: v });
                    if (!nextLayer)
                        return true;
                    return api.set({
                        startLayerId: nextLayer.id,
                        key,
                        path,
                        value,
                    });
                };
                const currentGetValue = currentLayer.api.get({ key });
                return maybePromise(currentGetValue, handleCurrentGetValue);
            }
            const currentSetRes = currentLayer.api.set({
                key,
                path,
                value: { value },
            });
            return maybePromise(currentSetRes, handleCurrentSet);
        },
        delete: ({ startLayerId, key, path }) => {
            const startLayerIndex = startLayerId
                ? layers.findIndex((l) => l.id === startLayerId)
                : 0;
            const currentLayer = layers[startLayerIndex];
            const nextLayer = layers[startLayerIndex + 1];
            if ((path === null || path === void 0 ? void 0 : path.length) && !currentLayer.api.supportsPaths) {
                const currentValue = api.get({ startLayerId: currentLayer.id, key });
                return maybePromise(currentValue, (v) => {
                    if (v === undefined)
                        return false;
                    const cv = (0, exports.getDeep)(v.value, path.slice(0, -1));
                    if (!cv)
                        return false;
                    if (Array.isArray(cv)) {
                        const index = path.slice(-1)[0];
                        if (!Number.isInteger(Number(index))) {
                            return false;
                        }
                        cv.splice(Number(index), 1);
                    }
                    else if (typeof cv !== 'object') {
                        delete cv[path.slice(-1)[0]];
                    }
                    else {
                        return false;
                    }
                    return maybePromise(currentLayer.api.set({ key, value: v }), (res) => {
                        if (!res || !nextLayer)
                            return false;
                        return api.delete({ startLayerId: nextLayer.id, key, path });
                    });
                });
            }
            const currentRes = currentLayer.api.delete({ key, path });
            return maybePromise(currentRes, (v) => {
                if (v === false)
                    return false;
                return api.delete({ startLayerId: nextLayer.id, key, path });
            });
        },
        clear: ({ startLayerId }) => {
            const startLayerIndex = startLayerId
                ? layers.findIndex((l) => l.id === startLayerId)
                : 0;
            const currentLayer = layers[startLayerIndex];
            const nextLayer = layers[startLayerIndex + 1];
            const currentRes = currentLayer.api.clear();
            return maybePromise(currentRes, (v) => {
                if (v === false)
                    return false;
                return api.clear({ startLayerId: nextLayer.id });
            });
        },
        upgrade: ({ key, path, from, to }) => {
            console.warn('"upgrade" method is not implemented yet');
            return false;
        },
        addLayer: ({ id, layer, after }) => {
            console.warn('"addLayer" method is not implemented yet');
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
__exportStar(require("./layers/runtimeLayer"), exports);
__exportStar(require("./layers/webStorageLayer"), exports);
__exportStar(require("./layers/remoteStorageLayer"), exports);
__exportStar(require("./layers/fileSystemLayer"), exports);
__exportStar(require("./layers/redisLayer"), exports);
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map