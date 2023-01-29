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
exports.VedoClient = void 0;
const utils_1 = require('./utils');
const axios_1 = __importDefault(require('axios'));
const MAX_LOGIN_RETRY = 15;
const DEFAULT_URL_CONFIG = {
  login: '/login.cgi',
  login_info: '/login.json',
  area_desc: '/user/area_desc.json',
  area_stat: '/user/area_stat.json',
  zone_desc: '/user/zone_desc.json',
  zone_stat: '/user/zone_stat.json',
  action: '/action.cgi',
  code_param: 'code',
};
const CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36';
class VedoClient {
  constructor(address, port = 80, config = {}) {
    this.address = address.startsWith('http://') ? address : `http://${address}`;
    if (port && port !== 80) {
      this.address = `${this.address}:${port}`;
    }
    this.config = Object.assign(Object.assign({}, DEFAULT_URL_CONFIG), config);
    this.logger = console;
  }
  setLogger(logger) {
    this.logger = logger;
  }
  login(code) {
    return __awaiter(this, void 0, void 0, function*() {
      const data = `${this.config.code_param}=${code}`;
      const resp = yield axios_1.default.post(`${this.address}${this.config.login}`, data, {
        headers: {
          'User-Agent': CHROME_USER_AGENT,
          'X-Requested-With': 'XMLHttpRequest',
          Accept: '*/*',
        },
      });
      if (resp.status >= 200 && resp.status < 300 && resp.headers['set-cookie']) {
        return resp.headers['set-cookie'][0];
      }
      throw new Error('No cookie in header');
    });
  }
  logout(uid) {
    return __awaiter(this, void 0, void 0, function*() {
      const data = `logout=1`;
      const resp = yield axios_1.default.post(`${this.address}${this.config.login}`, data, {
        headers: {
          Cookie: uid,
        },
      });
      if (resp.status >= 200 && resp.status < 300) {
        return true;
      }
      throw new Error('Cannot logout');
    });
  }
  loginWithRetry(code, maxRetries = MAX_LOGIN_RETRY) {
    return __awaiter(this, void 0, void 0, function*() {
      let retry = 0;
      let uid = null;
      let logged = false;
      const _login = code =>
        __awaiter(this, void 0, void 0, function*() {
          try {
            while (!uid && retry < maxRetries) {
              uid = yield this.login(code);
              retry++;
            }
            if (uid) {
              retry = 0;
              this.logger.debug(`Trying login with cookie ${uid}`);
              while (!logged && retry < maxRetries) {
                retry++;
                logged = yield this.isLogged(uid);
                if (logged) {
                  return uid;
                }
                yield utils_1.sleep(1000);
              }
            }
          } catch (e) {
            this.logger.error(`Error logging in: ${e.message}`);
          }
          return null;
        });
      while (uid === null && retry < maxRetries) {
        retry++;
        yield utils_1.sleep(1000);
        uid = yield _login(code);
      }
      if (uid === null) {
        throw new Error(`Cannot login after ${retry} retries`);
      } else {
        this.logger.debug(`Logged with token ${uid}`);
        return uid;
      }
    });
  }
  isLogged(uid) {
    return __awaiter(this, void 0, void 0, function*() {
      try {
        const loginInfo = yield utils_1.doGet(this.address, this.config.login_info, uid);
        return loginInfo.logged === 1 && loginInfo.rt_stat === 9;
      } catch (e) {
        this.logger.error(`Error checking login status: ${e.message}`);
        return false;
      }
    });
  }
  areaDesc(uid) {
    return __awaiter(this, void 0, void 0, function*() {
      this.logger.debug('Executing area desc call');
      return yield utils_1.doGet(this.address, this.config.area_desc, uid);
    });
  }
  areaStatus(uid) {
    return __awaiter(this, void 0, void 0, function*() {
      this.logger.debug('Executing area status call');
      return utils_1.doGet(this.address, this.config.area_stat, uid);
    });
  }
  zoneDesc(uid) {
    return __awaiter(this, void 0, void 0, function*() {
      this.logger.debug('Executing zone desc call');
      return utils_1.doGet(this.address, this.config.zone_desc, uid);
    });
  }
  zoneStatus(uid, zones) {
    return __awaiter(this, void 0, void 0, function*() {
      this.logger.debug('Executing zone status call');
      const page_list = [
        {
          hash: 'open',
          title: 'Aperte',
          bit_mask: 1,
          no_present: 'Nessuna zona aperta',
        },
        {
          hash: 'excluded',
          title: 'Escluse',
          bit_mask: 128,
          no_present: 'Nessuna zona esclusa',
        },
        {
          hash: 'isolated',
          title: 'Isolate',
          bit_mask: 256,
          no_present: 'Nessuna zona isolata',
        },
        {
          hash: 'sabotated',
          title: 'Sabotate/Guasto',
          bit_mask: 12,
          no_present: 'Nessuna zona sabotata/in guasto',
        },
        {
          hash: 'alarm',
          title: 'Allarme',
          bit_mask: 2,
          no_present: 'Nessuna zona in allarme',
        },
        {
          hash: 'inhibited',
          title: 'Inibite',
          bit_mask: 32768,
          no_present: 'Nessuna zona inibita',
        },
      ];
      const zoneDesc = zones || (yield utils_1.doGet(this.address, this.config.zone_desc, uid));
      const zoneStatus = yield utils_1.doGet(this.address, this.config.zone_stat, uid);
      const statuses = zoneStatus.status.split(',');
      return zoneDesc.in_area.reduce((activeZones, present, index) => {
        if (present !== 0) {
          const stat = {
            index: index + 1,
            description: zoneDesc.description[index],
          };
          const status = statuses[index];
          page_list.forEach(o => (stat[o.hash] = (parseInt(status, 16) & o.bit_mask) !== 0));
          activeZones.push(stat);
        }
        return activeZones;
      }, []);
    });
  }
  findActiveAreas(uid, areas) {
    return __awaiter(this, void 0, void 0, function*() {
      const areaDesc = areas || (yield this.areaDesc(uid));
      const areaStat = yield this.areaStatus(uid);
      return areaDesc.present
        .map((areaNum, index) => {
          if (areaNum === 1) {
            return {
              index,
              description: areaDesc.description[index],
              armed: areaStat.armed[index] !== 0,
              ready: areaStat.ready[index] === 0,
              triggered: areaStat.alarm[index] !== 0,
              sabotaged: areaStat.sabotage[index] !== 0,
            };
          }
          return null;
        })
        .filter(a => a !== null);
    });
  }
  arm(uid, area, force = true, scene = 'tot', logger) {
    return __awaiter(this, void 0, void 0, function*() {
      if (logger) {
        logger(uid);
        logger(area);
        logger(force);
        logger(scene);
        logger(
          JSON.stringify({
            params: {
              force: force ? '1' : '0',
              vedo: '1',
              [scene]: area,
              _: new Date().getTime(),
            },
            headers: {
              Cookie: uid,
              'X-Requested-With': 'XMLHttpRequest',
              Accept: '*/*',
            },
          })
        );
      }
      const resp = yield axios_1.default.get(`${this.address}${this.config.action}`, {
        params: {
          force: force ? '1' : '0',
          vedo: '1',
          [scene]: area,
          _: new Date().getTime(),
        },
        headers: {
          Cookie: uid,
          'X-Requested-With': 'XMLHttpRequest',
          Accept: '*/*',
        },
      });
      if (resp.status === 200) {
        return resp.data;
      }
      throw new Error(`Unable to arm alarm: ${resp.statusText}`);
    });
  }
  disarm(uid, area) {
    return __awaiter(this, void 0, void 0, function*() {
      const resp = yield axios_1.default.get(`${this.address}${this.config.action}`, {
        params: {
          force: '1',
          vedo: '1',
          dis: area,
          _: new Date().getTime(),
        },
        headers: {
          Cookie: uid,
          'X-Requested-With': 'XMLHttpRequest',
          Accept: '*/*',
        },
      });
      if (resp.status === 200) {
        return resp.data;
      }
      throw new Error(`Unable to disarm alarm: ${resp.statusText}`);
    });
  }
  excludeZone(uid, zoneIndex) {
    return __awaiter(this, void 0, void 0, function*() {
      const resp = yield axios_1.default.get(`${this.address}${this.config.action}`, {
        params: {
          vedo: '1',
          excl: zoneIndex,
          _: new Date().getTime(),
        },
        headers: {
          Cookie: uid,
          'X-Requested-With': 'XMLHttpRequest',
          Accept: '*/*',
        },
      });
      if (resp.status === 200) {
        return resp.data;
      }
      throw new Error(`Unable to exclude zone: ${resp.statusText}`);
    });
  }
  includeZone(uid, zoneIndex) {
    return __awaiter(this, void 0, void 0, function*() {
      const resp = yield axios_1.default.get(`${this.address}${this.config.action}`, {
        params: {
          vedo: '1',
          incl: zoneIndex,
          _: new Date().getTime(),
        },
        headers: {
          Cookie: uid,
          'X-Requested-With': 'XMLHttpRequest',
          Accept: '*/*',
        },
      });
      if (resp.status === 200) {
        return resp.data;
      }
      throw new Error(`Unable to exclude zone: ${resp.statusText}`);
    });
  }
  shutdown(uid) {
    return __awaiter(this, void 0, void 0, function*() {
      return this.logout(uid);
    });
  }
}
exports.VedoClient = VedoClient;
//# sourceMappingURL=vedo-client.js.map
