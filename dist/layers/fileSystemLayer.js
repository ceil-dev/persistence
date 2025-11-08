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
exports.createFileSystemLayer = void 0;
const createFileSystemLayer = ({ fs, prefix = '', folderPath = './', }) => ({
    get: (_a) => __awaiter(void 0, [_a], void 0, function* ({ key }) {
        try {
            const strEntry = fs.readFileSync(folderPath + prefix + key).toString();
            const entry = JSON.parse(strEntry);
            return entry;
        }
        catch (e) {
            return;
        }
    }),
    set: ({ key, value }) => {
        try {
            fs.writeFileSync(folderPath + prefix + key, JSON.stringify(value, null, 2), {
                flag: 'w',
            });
            return true;
        }
        catch (e) {
            console.warn(`fsLevel: Setting "${key}" failed with:\n `, (e === null || e === void 0 ? void 0 : e['message']) || e);
        }
        return false;
    },
    clear: () => {
        console.warn('fsLevel.clear: Not implemented yet...');
        return false;
    },
    delete: ({ key }) => {
        try {
            fs.unlinkSync(folderPath + prefix + key);
            return true;
        }
        catch (e) {
            console.warn(`fsLevel: Deleting "${key}" failed with:\n `, (e === null || e === void 0 ? void 0 : e['message']) || e);
        }
        return false;
    },
});
exports.createFileSystemLayer = createFileSystemLayer;
//# sourceMappingURL=fileSystemLayer.js.map