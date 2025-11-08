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
exports.createRemoteStorageLayer = void 0;
const createRemoteStorageLayer = ({ endpoint, fetch, secret = 'dnfio2e39jf239p4f2ji45f29p45fjn49', prefix = '', supportsPaths, }) => {
    const _fetch = ({ action, key, path, value, }) => fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
            action,
            key: prefix + key,
            path: supportsPaths ? path : undefined,
            value,
            secret,
        }),
    });
    return {
        get: (_a) => __awaiter(void 0, [_a], void 0, function* ({ key, path }) {
            const strEntry = yield (yield _fetch({
                action: 'get',
                path,
                key,
            })).text();
            if (!strEntry || typeof strEntry !== 'string') {
                return;
            }
            const entry = JSON.parse(strEntry);
            return entry;
        }),
        set: (_a) => __awaiter(void 0, [_a], void 0, function* ({ key, value }) {
            const res = yield _fetch({
                action: 'put',
                key,
                value: JSON.stringify(value),
            });
            return res.ok;
        }),
        clear: () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield _fetch({ action: 'clear' });
            return res.ok;
        }),
        delete: (_a) => __awaiter(void 0, [_a], void 0, function* ({ key }) {
            const res = yield _fetch({ action: 'delete', key });
            return res.ok;
        }),
        supportsPaths,
    };
};
exports.createRemoteStorageLayer = createRemoteStorageLayer;
//# sourceMappingURL=remoteStorageLayer.js.map