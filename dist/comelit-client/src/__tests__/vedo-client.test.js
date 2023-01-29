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
const vedo_client_1 = require('../vedo-client');
const nock_1 = __importDefault(require('nock'));
describe('vedo client', () => {
  it('should extract the cookie from the header when logging in', () =>
    __awaiter(void 0, void 0, void 0, function*() {
      nock_1
        .default('http://localhost')
        .post('/login.cgi', 'code=12345678')
        .reply(200, {}, { 'Set-Cookie': 'uid=B7FE1B2544A473F4' });
      nock_1
        .default('http://localhost')
        .get('/login.json')
        .reply(200, {
          life: 0,
          logged: 1,
          rt_stat: 9,
          permission: [false, false],
        });
      const client = new vedo_client_1.VedoClient('localhost');
      const uid = yield client.loginWithRetry('12345678');
      expect(uid).toBe('uid=B7FE1B2544A473F4');
    }));
  it('should retrive active areas', () =>
    __awaiter(void 0, void 0, void 0, function*() {
      nock_1
        .default('http://localhost')
        .get('/user/area_desc.json')
        .reply(200, {
          logged: 1,
          rt_stat: 9,
          vedo_auth: [0, 1],
          life: 1,
          present: [1, 0, 0, 0, 0, 0, 0, 0],
          description: ['RADAR', '', '', '', '', '', '', ''],
          p1_pres: [0, 0, 0, 0, 0, 0, 0, 0],
          p2_pres: [0, 0, 0, 0, 0, 0, 0, 0],
        });
      nock_1
        .default('http://localhost')
        .get('/user/area_stat.json')
        .reply(200, {
          logged: 1,
          rt_stat: 9,
          vedo_auth: [0, 1],
          life: 1,
          zone_open: 0,
          ready: [0, 0, 0, 0, 0, 0, 0, 0],
          armed: [0, 0, 0, 0, 0, 0, 0, 0],
          alarm: [0, 0, 0, 0, 0, 0, 0, 0],
          alarm_memory: [1, 0, 0, 0, 0, 0, 0, 0],
          sabotage: [0, 0, 0, 0, 0, 0, 0, 0],
          anomaly: [0, 0, 0, 0, 0, 0, 0, 0],
          in_time: [0, 0, 0, 0, 0, 0, 0, 0],
          out_time: [0, 0, 0, 0, 0, 0, 0, 0],
        });
      const client = new vedo_client_1.VedoClient('localhost');
      const areas = yield client.findActiveAreas('uid=B7FE1B2544A473F4');
      expect(areas.length).toBe(1);
      expect(areas[0].description).toBe('RADAR');
      expect(areas[0].ready).toBe(true);
      expect(areas[0].triggered).toBe(false);
      expect(areas[0].armed).toBe(false);
    }));
  it('should extract the cookie from the header when logging in with a different config', () =>
    __awaiter(void 0, void 0, void 0, function*() {
      nock_1
        .default('http://localhost')
        .post('/user/login.cgi', 'alm=12345678')
        .reply(200, {}, { 'Set-Cookie': 'sid=B7FE1B2544A473F4' });
      nock_1
        .default('http://localhost')
        .get('/user/login.json')
        .reply(200, {
          life: 0,
          logged: 1,
          rt_stat: 9,
          permission: [false, false],
        });
      const client = new vedo_client_1.VedoClient('localhost', null, {
        login: '/user/login.cgi',
        code_param: 'alm',
        login_info: '/user/login.json',
      });
      const uid = yield client.loginWithRetry('12345678');
      expect(uid).toBe('sid=B7FE1B2544A473F4');
    }));
  it('should stop login after max number of retries', () =>
    __awaiter(void 0, void 0, void 0, function*() {
      nock_1
        .default('http://localhost')
        .post('/login.cgi', 'code=12345678')
        .reply(200, {})
        .persist(true);
      const client = new vedo_client_1.VedoClient('localhost');
      const retry = 3;
      try {
        yield client.loginWithRetry('12345678', retry);
      } catch (e) {
        expect(e.message).toBe(`Cannot login after ${retry} retries`);
      }
    }));
});
//# sourceMappingURL=vedo-client.test.js.map
