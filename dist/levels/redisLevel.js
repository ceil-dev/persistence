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
exports.createRedisLevel = void 0;
const createRedisLevel = ({ client, prefix = '', next, }) => ({
    get: (_a) => __awaiter(void 0, [_a], void 0, function* ({ key }) {
        const strEntry = yield client.get(prefix + key);
        if (typeof strEntry !== 'string') {
            return;
        }
        const entry = JSON.parse(strEntry);
        return entry;
    }),
    set: ({ key, value }) => {
        return client.set(prefix + key, JSON.stringify(value));
    },
    clear: () => {
    },
    delete: ({ key }) => {
        return client.del(prefix + key);
    },
    next,
});
exports.createRedisLevel = createRedisLevel;
//# sourceMappingURL=redisLevel.js.map