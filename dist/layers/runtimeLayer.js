"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRuntimeLayer = void 0;
const __1 = require("..");
const createRuntimeLayer = (props) => {
    const storage = (props === null || props === void 0 ? void 0 : props.defaultData) || {};
    const prefix = (props === null || props === void 0 ? void 0 : props.prefix) || '';
    return {
        get: ({ key, path }) => {
            var _a;
            const root = storage[prefix + key];
            if (!(prefix + key in storage) || !(path === null || path === void 0 ? void 0 : path.length))
                return root;
            return { value: (0, __1.getDeep)((_a = storage[prefix + key]) === null || _a === void 0 ? void 0 : _a.value, path) };
        },
        set: ({ key, path, value }) => {
            if (!(path === null || path === void 0 ? void 0 : path.length)) {
                storage[prefix + key] = value;
                return true;
            }
            else {
                return (0, __1.setDeep)(storage[prefix + key], ['value', ...path], value.value);
            }
        },
        delete: ({ key, path }) => {
            if (path === null || path === void 0 ? void 0 : path.length) {
                const parentVal = (0, __1.getDeep)(storage, [
                    prefix + key,
                    'value',
                    ...path.slice(0, -1),
                ]);
                if (!parentVal)
                    return false;
                if (Array.isArray(parentVal)) {
                    const index = path.slice(-1)[0];
                    if (!Number.isInteger(Number(index))) {
                        return false;
                    }
                    parentVal.splice(Number(index), 1);
                }
                else if (typeof parentVal === 'object') {
                    delete parentVal[path.slice(-1)[0]];
                }
                else {
                    return false;
                }
            }
            else {
                delete storage[prefix + key];
            }
            return true;
        },
        clear: () => {
            const keys = Object.keys(storage);
            for (const key of keys) {
                delete storage[key];
            }
            return true;
        },
        supportsPaths: true,
    };
};
exports.createRuntimeLayer = createRuntimeLayer;
//# sourceMappingURL=runtimeLayer.js.map