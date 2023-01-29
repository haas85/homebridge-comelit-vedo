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
exports.ComelitSbClient = exports.getZoneKey = exports.getOtherKey = exports.getClimaKey = exports.getBlindKey = exports.getLightKey = void 0;
const axios_1 = __importDefault(require('axios'));
const types_1 = require('./types');
const comelit_client_1 = require('./comelit-client');
const ANONYMOUS = 99;
function getLightKey(index) {
  return `DOM#LT#${index}`;
}
exports.getLightKey = getLightKey;
function getBlindKey(index) {
  return `DOM#BL#${index}`;
}
exports.getBlindKey = getBlindKey;
function getClimaKey(index) {
  return `DOM#CL#${index}`;
}
exports.getClimaKey = getClimaKey;
function getOtherKey(index) {
  return `DOM#LC#${index}`;
}
exports.getOtherKey = getOtherKey;
function getZoneKey(index) {
  return `GEN#PL#${index}`;
}
exports.getZoneKey = getZoneKey;
function updateClima(value, thermostatData) {
  const [thermo, dehumidifier] = value;
  if (thermo) {
    const state = thermo[2]; // can be U, L, O
    const mode = thermo[3]; // can be M, A
    thermostatData.temperatura = thermo[0];
    switch (mode) {
      case 'M':
        thermostatData.auto_man =
          state === 'O' ? comelit_client_1.ClimaMode.OFF_MANUAL : comelit_client_1.ClimaMode.MANUAL;
        break;
      case 'A':
        thermostatData.auto_man =
          state === 'O' ? comelit_client_1.ClimaMode.OFF_AUTO : comelit_client_1.ClimaMode.AUTO;
        break;
    }
    thermostatData.soglia_attiva = thermo[4];
    if (state === 'L') {
      thermostatData.est_inv = comelit_client_1.ThermoSeason.SUMMER;
    } else if (state === 'U') {
      thermostatData.est_inv = comelit_client_1.ThermoSeason.WINTER;
    }
  }
  if (dehumidifier) {
    thermostatData.umidita = dehumidifier[0];
    const state = dehumidifier[2]; // can be U, L, O
    const mode = dehumidifier[3]; // can be M, A
    thermostatData.umidita = dehumidifier[0];
    switch (mode) {
      case 'M':
        thermostatData.auto_man_umi =
          state === 'O' ? comelit_client_1.ClimaMode.OFF_MANUAL : comelit_client_1.ClimaMode.MANUAL;
        break;
      case 'A':
        thermostatData.auto_man_umi =
          state === 'O' ? comelit_client_1.ClimaMode.OFF_AUTO : comelit_client_1.ClimaMode.AUTO;
        break;
    }
    thermostatData.soglia_attiva_umi = dehumidifier[4];
    if (state === 'L') {
      thermostatData.est_inv = comelit_client_1.ThermoSeason.SUMMER;
    } else if (state === 'U') {
      thermostatData.est_inv = comelit_client_1.ThermoSeason.WINTER;
    }
    thermostatData.soglia_attiva_umi = dehumidifier[4];
  }
}
class ComelitSbClient {
  constructor(address, port = 80, onUpdate, log) {
    this.address = address.startsWith('http://')
      ? `${address}:${port}`
      : `http://${address}:${port}`;
    this.onUpdate = onUpdate;
    this.log = log || console;
  }
  login() {
    return __awaiter(this, void 0, void 0, function*() {
      const info = yield axios_1.default.get(`${this.address}/login.json`);
      return info.status === 200 && info.data.logged === ANONYMOUS;
    });
  }
  shutdown() {
    return __awaiter(this, void 0, void 0, function*() {
      return Promise.resolve();
    });
  }
  fetchHomeIndex() {
    return __awaiter(this, void 0, void 0, function*() {
      const rooms = new Map();
      let data = yield this.fetchDeviceDesc('light');
      data.env_desc.forEach((desc, index) => {
        rooms.set(getZoneKey(index), {
          id: getZoneKey(index),
          objectId: `${index}`,
          status: types_1.STATUS_OFF,
          type: types_1.OBJECT_TYPE.ZONE,
          sub_type: types_1.OBJECT_SUBTYPE.GENERIC_ZONE,
          descrizione: desc || 'Root',
          elements: [],
        });
      }, rooms);
      if (data && data.desc) {
        data.desc.forEach((desc, index) => {
          const roomId = getZoneKey(data.env[index]);
          const room = rooms.get(roomId);
          room.elements.push({
            id: getLightKey(index),
            data: {
              id: getLightKey(index),
              objectId: `${index}`,
              status: data.status[index] === 1 ? types_1.STATUS_ON : types_1.STATUS_OFF,
              type: types_1.OBJECT_TYPE.LIGHT,
              sub_type:
                data.type[index] === 1
                  ? types_1.OBJECT_SUBTYPE.TEMPORIZED_LIGHT
                  : types_1.OBJECT_SUBTYPE.DIGITAL_LIGHT,
              descrizione: desc,
              isProtected: `${data.protected[index]}`,
              placeId: `${roomId}`,
            },
          });
        });
      }
      data = yield this.fetchDeviceDesc('shutter');
      if (data && data.desc) {
        data.desc.forEach((desc, index) => {
          const roomId = getZoneKey(data.env[index]);
          const room = rooms.get(roomId);
          room.elements.push({
            id: getBlindKey(index),
            data: {
              id: getBlindKey(index),
              objectId: `${index}`,
              status: data.status[index] === 1 ? types_1.STATUS_ON : types_1.STATUS_OFF,
              type: types_1.OBJECT_TYPE.BLIND,
              sub_type: types_1.OBJECT_SUBTYPE.ELECTRIC_BLIND,
              descrizione: desc,
              isProtected: `${data.protected[index]}`,
              placeId: `${roomId}`,
            },
          });
        });
      }
      data = yield this.fetchDeviceDesc('clima');
      if (data && data.desc) {
        data.desc.forEach((desc, index) => {
          const roomId = getZoneKey(data.env[index]);
          const room = rooms.get(roomId);
          const value = data.val[index];
          const thermostatData = {
            id: getClimaKey(index),
            objectId: `${index}`,
            status: data.status[index] === 1 ? types_1.STATUS_ON : types_1.STATUS_OFF,
            type: types_1.OBJECT_TYPE.THERMOSTAT,
            sub_type:
              data.type[index] >= 11 && data.type[index] <= 14 && data.type[index] !== 12
                ? types_1.OBJECT_SUBTYPE.CLIMA_THERMOSTAT_DEHUMIDIFIER
                : types_1.OBJECT_SUBTYPE.CLIMA_TERM,
            descrizione: desc,
            isProtected: `${data.protected[index]}`,
            placeId: `${roomId}`,
          };
          updateClima(value, thermostatData);
          room.elements.push({
            id: getClimaKey(index),
            data: thermostatData,
          });
        });
      }
      data = yield this.fetchDeviceDesc('other');
      if (data && data.desc) {
        data.desc.forEach((desc, index) => {
          const roomId = getZoneKey(data.env[index]);
          const room = rooms.get(roomId);
          room.elements.push({
            id: getOtherKey(index),
            data: {
              id: getOtherKey(index),
              objectId: `${index}`,
              status: data.status[index] === 1 ? types_1.STATUS_ON : types_1.STATUS_OFF,
              type: types_1.OBJECT_TYPE.OUTLET,
              sub_type: types_1.OBJECT_SUBTYPE.CONSUMPTION,
              descrizione: desc,
              isProtected: `${data.protected[index]}`,
              placeId: `${roomId}`,
            },
          });
        });
      }
      return new types_1.HomeIndex({
        id: comelit_client_1.ROOT_ID,
        objectId: comelit_client_1.ROOT_ID,
        status: types_1.STATUS_OFF,
        type: types_1.OBJECT_TYPE.ZONE,
        sub_type: types_1.OBJECT_SUBTYPE.GENERIC_ZONE,
        descrizione: 'root',
        elements: [...rooms.values()].map(dd => ({ id: dd.id, data: dd })),
      });
    });
  }
  fetchDeviceDesc(type) {
    return __awaiter(this, void 0, void 0, function*() {
      const resp = yield axios_1.default.get(`${this.address}/user/icon_desc.json`, {
        params: {
          type,
        },
      });
      if (resp.status === 200) {
        return resp.data;
      }
      throw new Error(`Unable to fetch description data for ${type}`);
    });
  }
  updateHomeStatus(homeIndex) {
    return __awaiter(this, void 0, void 0, function*() {
      if (homeIndex.lightsIndex.size > 0) {
        const info = yield this.fetchDevicesStatus('light');
        if (info.status === 200) {
          info.data.status.forEach((status, index) => {
            const id = getLightKey(index);
            const deviceData = homeIndex.lightsIndex.get(id);
            if (deviceData) {
              const updatedStatus = status === types_1.ON ? types_1.STATUS_ON : types_1.STATUS_OFF;
              if (updatedStatus !== deviceData.status) {
                deviceData.status = updatedStatus;
                this.updateSingleDevice(homeIndex, id, deviceData);
              }
            }
          });
        }
      }
      if (homeIndex.blindsIndex.size > 0) {
        const info = yield this.fetchDevicesStatus('shutter');
        if (info.status === 200) {
          info.data.status.forEach((status, index) => {
            const id = getBlindKey(index);
            const deviceData = homeIndex.blindsIndex.get(id);
            if (deviceData) {
              const updatedStatus = `${status}`; // can be 0, 1 or 2
              if (updatedStatus !== deviceData.status) {
                deviceData.status = updatedStatus;
                this.updateSingleDevice(homeIndex, id, deviceData);
              }
            }
          });
        }
      }
      if (homeIndex.outletsIndex.size > 0) {
        const info = yield this.fetchDevicesStatus('other');
        if (info.status === 200) {
          info.data.status.forEach((status, index) => {
            const id = getOtherKey(index);
            const deviceData = homeIndex.outletsIndex.get(id);
            if (deviceData) {
              const updatedStatus = status === types_1.ON ? types_1.STATUS_ON : types_1.STATUS_OFF;
              if (updatedStatus !== deviceData.status) {
                deviceData.status = updatedStatus;
                this.updateSingleDevice(homeIndex, id, deviceData);
              }
            }
          });
        }
      }
      if (homeIndex.thermostatsIndex.size > 0) {
        const info = yield this.fetchDevicesStatus('clima');
        if (info.status === 200) {
          info.data.status.forEach((status, index) => {
            const id = getClimaKey(index);
            const deviceData = homeIndex.thermostatsIndex.get(id);
            if (deviceData) {
              const value = info.data.val[index];
              deviceData.status = `${status}`;
              updateClima(value, deviceData);
              this.updateSingleDevice(homeIndex, id, deviceData);
            }
          });
        }
      }
      return homeIndex;
    });
  }
  updateSingleDevice(homeIndex, id, deviceData) {
    const newData = homeIndex.updateObject(id, deviceData);
    if (this.onUpdate && typeof this.onUpdate === 'function') {
      this.onUpdate(id, newData);
    }
  }
  toggleDeviceStatus(index, status, type) {
    return __awaiter(this, void 0, void 0, function*() {
      const resp = yield axios_1.default.get(`${this.address}/user/action.cgi`, {
        params: {
          type: type || 'light',
          [`num${status}`]: index,
        },
      });
      return resp.status === 200;
    });
  }
  setTemperature(clima, temperature) {
    return __awaiter(this, void 0, void 0, function*() {
      const resp = yield axios_1.default.get(`${this.address}/user/action.cgi`, {
        params: {
          clima,
          thermo: 'set',
          val: temperature,
        },
      });
      return resp.status === 200;
    });
  }
  switchThermostatMode(clima, mode) {
    return __awaiter(this, void 0, void 0, function*() {
      let thermo = null;
      if (mode) {
        switch (mode) {
          case comelit_client_1.ClimaMode.AUTO:
            thermo = 'auto';
            break;
          case comelit_client_1.ClimaMode.MANUAL:
            thermo = 'man';
            break;
          case comelit_client_1.ClimaMode.OFF_AUTO:
          case comelit_client_1.ClimaMode.OFF_MANUAL:
            return this.toggleHumidifierStatus(clima, comelit_client_1.ClimaOnOff.OFF_THERMO);
        }
      }
      const resp = yield axios_1.default.get(`${this.address}/user/action.cgi`, {
        params: {
          clima,
          thermo,
        },
      });
      return resp.status === 200;
    });
  }
  switchThermostatSeason(clima, season) {
    return __awaiter(this, void 0, void 0, function*() {
      const resp = yield axios_1.default.get(`${this.address}/user/action.cgi`, {
        params: {
          clima,
          thermo: season === comelit_client_1.ThermoSeason.WINTER ? 'upper' : 'lower',
        },
      });
      return resp.status === 200;
    });
  }
  setHumidity(humi, humidity) {
    return __awaiter(this, void 0, void 0, function*() {
      const resp = yield axios_1.default.get(`${this.address}/user/action.cgi`, {
        params: {
          humi,
          thermo: 'set',
          val: humidity,
        },
      });
      return resp.status === 200;
    });
  }
  switchHumidifierMode(humi, mode) {
    return __awaiter(this, void 0, void 0, function*() {
      let thermo = null;
      if (mode) {
        switch (mode) {
          case comelit_client_1.ClimaMode.AUTO:
            thermo = 'auto';
            break;
          case comelit_client_1.ClimaMode.MANUAL:
            thermo = 'man';
            break;
          case comelit_client_1.ClimaMode.OFF_AUTO:
          case comelit_client_1.ClimaMode.OFF_MANUAL:
            return this.toggleHumidifierStatus(humi, comelit_client_1.ClimaOnOff.OFF_THERMO);
        }
      }
      const resp = yield axios_1.default.get(`${this.address}/user/action.cgi`, {
        params: {
          humi,
          thermo,
        },
      });
      return resp.status === 200;
    });
  }
  toggleThermostatStatus(clima, mode) {
    return __awaiter(this, void 0, void 0, function*() {
      const resp = yield axios_1.default.get(`${this.address}/user/action.cgi`, {
        params: {
          clima,
          thermo: mode === comelit_client_1.ClimaOnOff.ON_THERMO ? 'on' : 'off',
        },
      });
      return resp.status === 200;
    });
  }
  toggleHumidifierStatus(humi, mode) {
    return __awaiter(this, void 0, void 0, function*() {
      const resp = yield axios_1.default.get(`${this.address}/user/action.cgi`, {
        params: {
          humi,
          thermo: mode === comelit_client_1.ClimaOnOff.ON_HUMI ? 'on' : 'off',
        },
      });
      return resp.status === 200;
    });
  }
  fetchDevicesStatus(type) {
    return __awaiter(this, void 0, void 0, function*() {
      return yield axios_1.default.get(`${this.address}/user/icon_status.json`, {
        params: {
          type,
        },
      });
    });
  }
}
exports.ComelitSbClient = ComelitSbClient;
//# sourceMappingURL=comelit-sb-client.js.map
