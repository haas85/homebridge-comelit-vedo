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
Object.defineProperty(exports, '__esModule', { value: true });
exports.VedoAlarm = void 0;
const src_1 = require('../comelit-client/src');
const lodash_1 = require('lodash');
const ALL = 32;
const DEFAULT_LOGIN_TIMEOUT = 15000;
class VedoAlarm {
  constructor(platform, accessory, address, port, code, config) {
    this.platform = platform;
    this.accessory = accessory;
    this.log = platform.log;
    this.code = code;
    this.name = 'VEDO Alarm @ ' + address;
    this.client = new src_1.VedoClient(address, port, config);
    this.client.setLogger(platform.log);
    this.away_areas = config.away_areas ? config.away_areas.map(a => a.toLowerCase().trim()) : [];
    this.night_areas = config.night_areas
      ? config.night_areas.map(a => a.toLowerCase().trim())
      : [];
    this.home_areas = config.home_areas ? config.home_areas.map(a => a.toLowerCase().trim()) : [];
    this.lastLogin = 0;
    this.armedScene = null;
    this.log.info('Mapping areas set to ', this.night_areas, this.away_areas, this.home_areas);
    this.getAvailableServices();
  }
  update(alarmAreas) {
    const Characteristic = this.platform.homebridge.hap.Characteristic;
    const currentAlarmStatus = this.securityService.getCharacteristic(
      Characteristic.SecuritySystemCurrentState
    ).value;
    const armedAreas = alarmAreas.filter(area => area.armed).map(a => a.description.toLowerCase());
    const statusArmed = armedAreas.length !== 0;
    if (statusArmed) {
      this.log.debug(`Found ${armedAreas.length} armed areas: ${armedAreas.join(', ')}`);
    } else {
      this.log.debug('No armed areas');
    }
    const triggered = alarmAreas.reduce(
      (triggered, area) => triggered || area.triggered || area.sabotaged,
      false
    );
    if (triggered) {
      const s = alarmAreas
        .filter(a => a.triggered || a.sabotaged)
        .map(a => a.description)
        .join(', ');
      this.log.warn(`Alarm triggered in area ${s}`);
    } else {
      this.log.debug('No triggering areas');
    }
    if (
      triggered &&
      currentAlarmStatus !== Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED
    ) {
      this.securityService.updateCharacteristic(
        Characteristic.SecuritySystemCurrentState,
        Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED
      );
      return;
    }
    if (statusArmed) {
      if (
        this.away_areas.length &&
        lodash_1.intersection(armedAreas, this.away_areas).length === armedAreas.length &&
        !this.armedScene
      ) {
        this.log.debug('Setting new status to AWAY_ARM');
        this.securityService.updateCharacteristic(
          Characteristic.SecuritySystemCurrentState,
          Characteristic.SecuritySystemCurrentState.AWAY_ARM
        );
        this.securityService.updateCharacteristic(
          Characteristic.SecuritySystemTargetState,
          Characteristic.SecuritySystemTargetState.AWAY_ARM
        );
      } else if (
        this.home_areas.length &&
        lodash_1.intersection(armedAreas, this.home_areas).length === armedAreas.length &&
        !this.armedScene
      ) {
        this.log.debug('Setting new status to STAY_ARM');
        this.securityService.updateCharacteristic(
          Characteristic.SecuritySystemCurrentState,
          Characteristic.SecuritySystemCurrentState.STAY_ARM
        );
        this.securityService.updateCharacteristic(
          Characteristic.SecuritySystemTargetState,
          Characteristic.SecuritySystemTargetState.STAY_ARM
        );
      } else if (
        this.armedScene === 'p1'
        // this.night_areas.length &&
        // intersection(armedAreas, this.night_areas).length === armedAreas.length
      ) {
        this.log.debug('Setting new status to NIGHT_ARM');
        this.securityService.updateCharacteristic(
          Characteristic.SecuritySystemCurrentState,
          Characteristic.SecuritySystemCurrentState.NIGHT_ARM
        );
        this.securityService.updateCharacteristic(
          Characteristic.SecuritySystemTargetState,
          Characteristic.SecuritySystemTargetState.NIGHT_ARM
        );
      } else {
        this.log.debug('Setting new status to AWAY_ARM (default)');
        this.securityService.updateCharacteristic(
          Characteristic.SecuritySystemCurrentState,
          Characteristic.SecuritySystemCurrentState.AWAY_ARM
        );
        this.securityService.updateCharacteristic(
          Characteristic.SecuritySystemTargetState,
          Characteristic.SecuritySystemTargetState.AWAY_ARM
        );
      }
    } else {
      this.log.debug('Setting new status to DISARMED');
      this.securityService.updateCharacteristic(
        Characteristic.SecuritySystemCurrentState,
        Characteristic.SecuritySystemCurrentState.DISARMED
      );
      this.securityService.updateCharacteristic(
        Characteristic.SecuritySystemTargetState,
        Characteristic.SecuritySystemTargetState.DISARM
      );
    }
  }
  fetchZones() {
    return __awaiter(this, void 0, void 0, function*() {
      try {
        yield this.refreshUID();
        if (!this.zones) {
          this.zones = yield this.client.zoneDesc(this.lastUID);
        }
        return yield this.client.zoneStatus(this.lastUID, this.zones);
      } catch (e) {
        this.log.error(`Error fetching zones: ${e.message}`);
      }
      this.log.error('Unable to fetch token');
      this.lastUID = null;
      return null;
    });
  }
  checkAlarm() {
    return __awaiter(this, void 0, void 0, function*() {
      try {
        yield this.refreshUID();
        if (!this.areas) {
          this.areas = yield this.client.areaDesc(this.lastUID);
        }
        return yield this.client.findActiveAreas(this.lastUID, this.areas);
      } catch (e) {
        this.log.error(`Error checking alarm: ${e.message}`);
      }
      this.log.error('Unable to fetch token');
      this.lastUID = null;
      return null;
    });
  }
  includeZone(index) {
    return __awaiter(this, void 0, void 0, function*() {
      try {
        yield this.refreshUID();
        yield this.client.includeZone(this.lastUID, index);
      } catch (e) {
        this.log.error(`Error including zone: ${e.message}`);
      }
      this.log.error('Unable to fetch token');
      this.lastUID = null;
      return null;
    });
  }
  excludeZone(index) {
    return __awaiter(this, void 0, void 0, function*() {
      try {
        yield this.refreshUID();
        yield this.client.excludeZone(this.lastUID, index);
      } catch (e) {
        this.log.error(`Error excluding zone: ${e.message}`);
      }
      this.log.error('Unable to fetch token');
      this.lastUID = null;
      return null;
    });
  }
  getAvailableServices() {
    const Characteristic = this.platform.homebridge.hap.Characteristic;
    const Service = this.platform.homebridge.hap.Service;
    const accessoryInformation =
      this.accessory.getService(Service.AccessoryInformation) ||
      this.accessory.addService(Service.AccessoryInformation);
    accessoryInformation
      .setCharacteristic(Characteristic.Name, 'Vedo Alarm')
      .setCharacteristic(Characteristic.Manufacturer, 'Comelit')
      .setCharacteristic(Characteristic.Model, 'None')
      .setCharacteristic(Characteristic.FirmwareRevision, 'None')
      .setCharacteristic(Characteristic.SerialNumber, 'None');
    this.securityService =
      this.accessory.getService(Service.SecuritySystem) ||
      this.accessory.addService(Service.SecuritySystem);
    this.securityService.setCharacteristic(Characteristic.Name, 'VEDO Alarm');
    const validValues = [
      Characteristic.SecuritySystemTargetState.DISARM,
      Characteristic.SecuritySystemTargetState.AWAY_ARM,
    ];
    if (this.night_areas.length || true) {
      validValues.push(Characteristic.SecuritySystemTargetState.NIGHT_ARM);
    }
    if (this.home_areas.length) {
      validValues.push(Characteristic.SecuritySystemTargetState.STAY_ARM);
    }
    this.securityService.updateCharacteristic(
      Characteristic.SecuritySystemTargetState,
      Characteristic.SecuritySystemTargetState.DISARM
    );
    this.securityService.updateCharacteristic(
      Characteristic.SecuritySystemCurrentState,
      Characteristic.SecuritySystemCurrentState.DISARMED
    );
    this.securityService
      .getCharacteristic(Characteristic.SecuritySystemTargetState)
      .setProps({
        validValues,
      })
      .on('set' /* SET */, (value, callback) =>
        __awaiter(this, void 0, void 0, function*() {
          return this.setTargetState(value, callback);
        })
      );
    return [accessoryInformation, this.securityService];
  }
  armAreas(areas, uid, scene) {
    return __awaiter(this, void 0, void 0, function*() {
      this.log.info(`Arming system: ${areas.length ? areas.join(', ') : 'ALL SYSTEM'}`);
      const alarmAreas = yield this.client.findActiveAreas(uid);
      if (areas && areas.length) {
        const indexes = areas
          .map(area => alarmAreas.findIndex(a => a.description.toLowerCase() === area))
          .filter(index => index !== -1);
        if (indexes.length) {
          const promises = indexes.map(index => this.client.arm(uid, index, undefined, scene));
          yield Promise.all(promises);
          return indexes;
        }
      }
      yield this.client.arm(uid, ALL, undefined, scene);
      this.armedScene = scene;
      return [ALL];
    });
  }
  refreshUID() {
    return __awaiter(this, void 0, void 0, function*() {
      if (this.shouldLogin() || this.getTimeElapsedFromLastLogin() > DEFAULT_LOGIN_TIMEOUT) {
        if (this.lastUID) {
          yield this.client.logout(this.lastUID);
        }
        this.lastUID = null;
        this.lastUID = yield this.client.loginWithRetry(this.code);
        this.lastLogin = new Date().getTime();
      }
    });
  }
  shouldLogin() {
    return !this.lastUID || this.getTimeElapsedFromLastLogin() > DEFAULT_LOGIN_TIMEOUT;
  }
  getTimeElapsedFromLastLogin() {
    const now = new Date().getTime();
    return now - this.lastLogin;
  }
  setTargetState(value, callback) {
    return __awaiter(this, void 0, void 0, function*() {
      const Characteristic = this.platform.homebridge.hap.Characteristic;
      try {
        const uid = yield this.client.loginWithRetry(this.code);
        if (uid) {
          switch (value) {
            case Characteristic.SecuritySystemTargetState.DISARM:
              this.log.info('Disarming system');
              this.armedScene = null;
              yield this.client.disarm(uid, ALL);
              callback();
              break;
            case Characteristic.SecuritySystemTargetState.AWAY_ARM:
              this.log.info('Arm system: AWAY');
              yield this.armAreas(this.away_areas, uid);
              callback();
              break;
            case Characteristic.SecuritySystemTargetState.NIGHT_ARM:
              this.log.info('Arm system: NIGHT (P1)');
              yield this.armAreas(this.night_areas, uid, 'p1');
              callback();
              break;
            case Characteristic.SecuritySystemTargetState.STAY_ARM:
              this.log.info('Arm system: STAY');
              yield this.armAreas(this.home_areas, uid);
              callback();
              break;
            default:
              callback(new Error(`Cannot execute requested action ${value}`));
          }
        } else {
          callback(new Error('Cannot login into system'));
        }
      } catch (e) {
        callback(e);
      }
    });
  }
}
exports.VedoAlarm = VedoAlarm;
//# sourceMappingURL=vedo-alarm.js.map
