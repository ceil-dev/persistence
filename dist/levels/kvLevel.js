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
exports.createKVLevel = void 0;
const createKVLevel = (_a) => {
    var { client, prefix = '' } = _a, rest = __rest(_a, ["client", "prefix"]);
    return (Object.assign({ get: (_a) => __awaiter(void 0, [_a], void 0, function* ({ key }) {
            const strEntry = yield client.get(prefix + key);
            if (typeof strEntry !== 'string') {
                return;
            }
            const entry = JSON.parse(strEntry);
            return entry;
        }), set: ({ key, value }) => {
            return client.set(prefix + key, JSON.stringify(value));
        }, clear: () => {
        }, delete: ({ key }) => {
            return client.del(prefix + key);
        } }, rest));
};
exports.createKVLevel = createKVLevel;
//# sourceMappingURL=kvLevel.js.map