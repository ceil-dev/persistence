"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRuntimeLevel = void 0;
const createRuntimeLevel = (props) => {
    const storage = (props === null || props === void 0 ? void 0 : props.defaultData) || {};
    const next = props === null || props === void 0 ? void 0 : props.next;
    const prefix = (props === null || props === void 0 ? void 0 : props.prefix) || '';
    return {
        get: ({ key }) => {
            return storage[prefix + key];
        },
        set: ({ key, value }) => {
            storage[prefix + key] = value;
            return;
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
    };
};
exports.createRuntimeLevel = createRuntimeLevel;
//# sourceMappingURL=runtimeLevel.js.map