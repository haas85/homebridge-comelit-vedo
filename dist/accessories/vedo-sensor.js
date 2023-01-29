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
exports.VedoSensor = void 0;
const prom_client_1 = __importDefault(require('prom-client'));
const triggers_count = new prom_client_1.default.Counter({
  name: 'comelit_vedo_sensor_triggers',
  help: 'Number of triggered sensors',
});
class VedoSensor {
  constructor(platform, accessory, name, zoneStatus, alarm) {
    this.log = platform.log;
    this.accessory = accessory;
    this.platform = platform;
    this.name = name;
    this.zoneStatus = zoneStatus;
    this.alarm = alarm;
    this.getAvailableServices();
  }
  update(zoneStatus) {
    const Characteristic = this.platform.homebridge.hap.Characteristic;
    const currentValue = this.sensorService.getCharacteristic(Characteristic.OccupancyDetected)
      .value;
    const newValue = zoneStatus.open
      ? Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
      : Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED;
    if (currentValue !== newValue) {
      if (newValue === Characteristic.OccupancyDetected.OCCUPANCY_DETECTED) {
        this.log.debug(`Occupancy detected for sensor ${this.name}`);
        triggers_count.inc();
      }
      this.sensorService.getCharacteristic(Characteristic.OccupancyDetected).updateValue(newValue);
    }
    this.sensorService.updateCharacteristic(Characteristic.Active, !zoneStatus.excluded);
    Object.assign(this.zoneStatus, zoneStatus);
  }
  getAvailableServices() {
    const Service = this.platform.homebridge.hap.Service;
    const Characteristic = this.platform.homebridge.hap.Characteristic;
    const accessoryInformation =
      this.accessory.getService(Service.AccessoryInformation) ||
      this.accessory.addService(Service.AccessoryInformation);
    accessoryInformation
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, 'Comelit')
      .setCharacteristic(Characteristic.Model, 'None')
      .setCharacteristic(Characteristic.FirmwareRevision, 'None')
      .setCharacteristic(Characteristic.SerialNumber, 'None');
    this.sensorService =
      this.accessory.getService(Service.OccupancySensor) ||
      this.accessory.addService(Service.OccupancySensor);
    this.sensorService.setCharacteristic(Characteristic.Name, this.name);
    this.update(this.zoneStatus);
    this.switchService =
      this.accessory.getService(Service.Switch) || this.accessory.addService(Service.Switch);
    this.switchService
      .getCharacteristic(Characteristic.On)
      .on('set' /* SET */, (value, callback) =>
        __awaiter(this, void 0, void 0, function*() {
          try {
            if (value) {
              yield this.alarm.includeZone(this.zoneStatus.index);
            } else {
              yield this.alarm.excludeZone(this.zoneStatus.index);
            }
            return callback();
          } catch (e) {
            callback(e);
          }
        })
      )
      .on('get' /* GET */, callback => {
        return callback(null, this.zoneStatus.excluded === false);
      });
    return [accessoryInformation, this.sensorService, this.switchService];
  }
}
exports.VedoSensor = VedoSensor;
//# sourceMappingURL=vedo-sensor.js.map
