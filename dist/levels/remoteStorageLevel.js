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
exports.createRemoteStorageLevel = void 0;
const SECRET = 'dnfio2e39jf239p4f2ji45f29p45fjn49';
const createRemoteStorageLevel = ({ endpoint, fetch, prefix = '', next, }) => {
    const _fetch = ({ action, key, value, }) => fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
            action,
            key: prefix + key,
            value,
            secret: SECRET,
        }),
    });
    return {
        get: (_a) => __awaiter(void 0, [_a], void 0, function* ({ key }) {
            const strEntry = yield (yield _fetch({
                action: 'get',
                key,
            })).text();
            if (!strEntry || typeof strEntry !== 'string') {
                return;
            }
            const entry = JSON.parse(strEntry);
            return entry;
        }),
        set: ({ key, value }) => {
            _fetch({ action: 'put', key, value: JSON.stringify(value) });
        },
        clear: () => {
            _fetch({ action: 'clear' });
        },
        delete: ({ key }) => {
            _fetch({ action: 'delete', key });
        },
        next,
    };
};
exports.createRemoteStorageLevel = createRemoteStorageLevel;
//# sourceMappingURL=remoteStorageLevel.js.map