"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRuntimeLevel = void 0;
const __1 = require("../");
const createRuntimeLevel = (props) => {
    const storage = (props === null || props === void 0 ? void 0 : props.defaultData) || {};
    const next = props === null || props === void 0 ? void 0 : props.next;
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
        delete: ({ key }) => {
            delete storage[prefix + key];
            return;
        },
        clear: () => {
            const keys = Object.getOwnPropertyNames(storage);
            for (const key of keys) {
                delete storage[key];
            }
            return;
        },
        next: next,
        supportsPaths: true,
    };
};
exports.createRuntimeLevel = createRuntimeLevel;
//# sourceMappingURL=runtimeLevel.js.map