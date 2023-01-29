'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function(resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.sleep = exports.doGet = exports.generateUUID = void 0;
const crypto_1 = __importDefault(require('crypto'));
const axios_1 = __importDefault(require('axios'));
// See https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
function generateUUID(data) {
  const sha1sum = crypto_1.default.createHash('sha1');
  sha1sum.update(data);
  const s = sha1sum.digest('hex');
  let i = -1;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    i += 1;
    switch (c) {
      case 'y':
        return ((parseInt('0x' + s[i], 16) & 0x3) | 0x8).toString(16);
      case 'x':
      default:
        return s[i];
    }
  });
}
exports.generateUUID = generateUUID;
axios_1.default.defaults.timeout = 3000;
function doGet(address, path, uid, params = null) {
  return __awaiter(this, void 0, void 0, function*() {
    const resp = yield axios_1.default.get(`${address}${path}`, {
      params,
      headers: {
        Cookie: uid,
        'X-Requested-With': 'XMLHttpRequest',
        Accept: '*/*',
      },
    });
    if (resp.status >= 200 && resp.status < 300) {
      return resp.data;
    }
    throw new Error(`Unable to GET data: ${resp.statusText}`);
  });
}
exports.doGet = doGet;
function sleep(time) {
  return __awaiter(this, void 0, void 0, function*() {
    return new Promise(resolve => setTimeout(() => resolve(), time));
  });
}
exports.sleep = sleep;
//# sourceMappingURL=utils.js.map
