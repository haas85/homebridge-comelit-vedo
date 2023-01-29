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
const nock_1 = __importDefault(require('nock'));
const comelit_sb_client_1 = require('../comelit-sb-client');
const types_1 = require('../types');
function mockLightIconDesc() {
  nock_1
    .default('http://localhost:8090')
    .get('/user/icon_desc.json?type=light')
    .reply(200, {
      num: 21,
      desc: [
        'Faretti ingresso',
        'Soffitto',
        'Presa Angolo',
        'Presa Parete',
        'Soffitto',
        'Luci pensili',
        'Faretti',
        'Soffitto',
        'Prese Comandate',
        'Soffitto',
        'Prese Comandate',
        'Soffitto',
        'Presa Comandata',
        'Armadio dx',
        'Armadio sx',
        'Soffitto',
        'Specchio',
        'Soffitto',
        'Specchio',
        'Led doccia',
        'Terrazzo',
      ],
      env: [1, 1, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 6, 6, 7, 7, 8, 8, 8, 9],
      status: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      val: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      type: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      protected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      env_desc: [
        '',
        'Salotto',
        'Cucina',
        'Corridoio notte',
        'Camera 1',
        'Camera 2',
        'Matrimoniale',
        'Bagno Giorno',
        'Bagno Notte',
        'Terrazzo',
      ],
    });
}
function mockShutterIconDesc() {
  nock_1
    .default('http://localhost:8090')
    .get('/user/icon_desc.json?type=shutter')
    .reply(200, {
      num: 10,
      desc: [
        'Salotto dx',
        'Salotto sx',
        'Cucina',
        'Camera 1',
        'Camera 2 dx',
        'Camera 2 sx',
        'Matrimoniale Fronte',
        'Matrimoniale Retro',
        'Bagno Giorno',
        'Bagno Notte',
      ],
      env: [1, 1, 2, 4, 5, 5, 6, 6, 7, 8],
      status: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      val: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      type: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      protected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      env_desc: [
        '',
        'Salotto',
        'Cucina',
        'Corridoio notte',
        'Camera 1',
        'Camera 2',
        'Matrimoniale',
        'Bagno Giorno',
        'Bagno Notte',
        'Terrazzo',
      ],
    });
}
function mockClimaIconDesc() {
  nock_1
    .default('http://localhost:8090')
    .get('/user/icon_desc.json?type=clima')
    .reply(200, {
      num: 1,
      desc: ['Termostato'],
      env: [0],
      status: [0],
      val: [
        [
          [204, 0, 'U', 'M', 200, 0, 0, 'N'],
          [0, 0, 'O', 'A', 0, 0, 0, 'N'],
          [0, 0],
        ],
      ],
      type: [6],
      protected: [0],
      env_desc: [
        '',
        'Esterno',
        'Zona Notte',
        'Zona Giorno',
        'Baracca',
        'Terrazzo',
        'Camera da letto',
        'Bagno',
        'Ripostiglio',
        'Studio',
        'Salotto',
        'Cucina',
      ],
    });
}
function mockOtherIconDesc() {
  nock_1
    .default('http://localhost:8090')
    .get('/user/icon_desc.json?type=other')
    .reply(200, {
      num: 10,
      desc: [
        'Prese Bancone',
        'Prese Baracca',
        'Prese Terrazza',
        'Succhia merda',
        'Phon',
        'Lavatrice',
        'Estrattore Ripostigl',
        'Lavastoviglie',
        'Microonde',
        'Forno',
      ],
      env: [1, 1, 2, 4, 5, 5, 6, 6, 7, 8],
      status: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      val: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      type: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      protected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      env_desc: [
        '',
        'Esterno',
        'Zona Notte',
        'Zona Giorno',
        'Baracca',
        'Terrazzo',
        'Camera da letto',
        'Bagno',
        'Ripostiglio',
        'Studio',
        'Salotto',
        'Cucina',
      ],
    });
}
describe('Comelit Serial Bridge client', () => {
  it('should execute login', () =>
    __awaiter(void 0, void 0, void 0, function*() {
      nock_1
        .default('http://localhost:8090')
        .get('/login.json')
        .reply(200, {
          domus: '100CC0C00CC0',
          life: 0,
          logged: 99,
          rt_stat: 0,
          old_auth: '000000000',
          dataora: 0,
          toolbar: '',
          icon_status: '001212200',
        });
      const client = new comelit_sb_client_1.ComelitSbClient('localhost', 8090);
      const logged = yield client.login();
      expect(logged).toBe(true);
    }));
  it('should read house structure', () =>
    __awaiter(void 0, void 0, void 0, function*() {
      mockLightIconDesc();
      mockShutterIconDesc();
      mockClimaIconDesc();
      mockOtherIconDesc();
      const client = new comelit_sb_client_1.ComelitSbClient('localhost', 8090);
      const homeIndex = yield client.fetchHomeIndex();
      expect(homeIndex).toBeDefined();
      expect(homeIndex.roomsIndex.size).toBe(10);
      expect(homeIndex.blindsIndex.size).toBe(10);
      expect(homeIndex.lightsIndex.get(`DOM#LT#0`).status).toBe(types_1.STATUS_ON);
      expect(homeIndex.lightsIndex.get(`DOM#LT#1`).status).toBe(types_1.STATUS_ON);
      expect(homeIndex.lightsIndex.get(`DOM#LT#2`).status).toBe(types_1.STATUS_OFF);
    }));
  it('should update the status of index', () =>
    __awaiter(void 0, void 0, void 0, function*() {
      mockLightIconDesc();
      mockShutterIconDesc();
      mockClimaIconDesc();
      mockOtherIconDesc();
      nock_1
        .default('http://localhost:8090')
        .get('/user/icon_status.json?type=light')
        .reply(200, {
          life: 1,
          domus: '10CC0CC00C00',
          status: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          val: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        });
      nock_1
        .default('http://localhost:8090')
        .get('/user/icon_status.json?type=shutter')
        .reply(200, {
          life: 1,
          domus: '10CC0CC00C00',
          status: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          val: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        });
      nock_1
        .default('http://localhost:8090')
        .get('/user/icon_status.json?type=other')
        .reply(200, {
          life: 1,
          domus: '10CC0CC00C00',
          status: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          val: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        });
      nock_1
        .default('http://localhost:8090')
        .get('/user/icon_status.json?type=clima')
        .reply(200, {
          life: 1,
          domus: '100CC0C00CC0',
          status: [0],
          val: [
            [
              [210, 0, 'U', 'M', 200, 0, 0, 'N'],
              [0, 0, 'O', 'A', 0, 0, 0, 'N'],
              [0, 0],
            ],
          ],
        });
      const client = new comelit_sb_client_1.ComelitSbClient('localhost', 8090);
      const homeIndex = yield client.fetchHomeIndex();
      yield client.updateHomeStatus(homeIndex);
      expect(homeIndex.lightsIndex.get(`DOM#LT#0`).status).toBe(types_1.STATUS_ON);
      expect(homeIndex.lightsIndex.get(`DOM#LT#1`).status).toBe(types_1.STATUS_OFF);
      expect(homeIndex.lightsIndex.get(`DOM#LT#2`).status).toBe(types_1.STATUS_ON);
      expect(homeIndex.blindsIndex.get(`DOM#BL#0`).status).toBe(types_1.STATUS_ON);
      expect(homeIndex.thermostatsIndex.get(`DOM#CL#0`).temperatura).toBe(210);
    }));
});
//# sourceMappingURL=bridge-client.test.js.map
