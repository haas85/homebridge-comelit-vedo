'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function() {
            return m[k];
          },
        });
      }
    : function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function(o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function(o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
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
exports.ComelitVedoPlatform = void 0;
const src_1 = require('./comelit-client/src');
const vedo_alarm_1 = require('./accessories/vedo-alarm');
const vedo_sensor_1 = require('./accessories/vedo-sensor');
const express_1 = __importDefault(require('express'));
const prom_client_1 = __importStar(require('prom-client'));
const constants_1 = require('./constants');
const polling = new prom_client_1.default.Gauge({
  name: 'comelit_vedo_polling',
  help: 'Comelit client polling beat',
  labelNames: ['service'],
});
const DEFAULT_HTTP_PORT = 3003;
const expr = express_1.default();
expr.get('/metrics', (req, res) => {
  res.set('Content-Type', prom_client_1.register.contentType);
  res.end(prom_client_1.register.metrics());
});
const DEFAULT_ALARM_CHECK_TIMEOUT = 5000;
class ComelitVedoPlatform {
  constructor(log, config, homebridge) {
    this.log = log;
    this.config = config;
    // Save the API object as plugin needs to register new accessory via this object
    this.homebridge = homebridge;
    this.accessories = new Map();
    this.log.info(
      'Initializing platform: ',
      Object.assign(Object.assign({}, config), { alarm_code: '******' })
    );
    this.log.debug(`Homebridge API version: ${homebridge.version}`);
    this.homebridge.on('didFinishLaunching' /* DID_FINISH_LAUNCHING */, () =>
      __awaiter(this, void 0, void 0, function*() {
        return yield this.discoverDevices();
      })
    );
    this.homebridge.on('shutdown' /* SHUTDOWN */, () =>
      __awaiter(this, void 0, void 0, function*() {
        return yield this.shutdown();
      })
    );
  }
  configureAccessory(accessory) {
    this.accessories.set(accessory.UUID, accessory);
  }
  startPolling() {
    return __awaiter(this, void 0, void 0, function*() {
      if (!this.server && this.config.export_prometheus_metrics) {
        this.server = expr.listen(this.config.exporter_http_port || DEFAULT_HTTP_PORT);
      }
      const checkFrequency = this.getCheckFrequency();
      this.log.info(`Setting up polling timeout every ${checkFrequency / 1000} secs`);
      this.pollAlarm();
      yield src_1.sleep(1000); //give a second between calls
      this.pollSensors();
      this.timeoutSentinel = setInterval(
        () =>
          __awaiter(this, void 0, void 0, function*() {
            yield this.sentinel();
          }),
        1000
      );
    });
  }
  getCheckFrequency() {
    return this.config.update_interval
      ? this.config.update_interval * 1000
      : DEFAULT_ALARM_CHECK_TIMEOUT;
  }
  sentinel() {
    return __awaiter(this, void 0, void 0, function*() {
      const now = Date.now();
      if (this.timeoutAlarm) {
        if (this.lastAlarmCheck - now > 5 * this.getCheckFrequency()) {
          this.log.warn('Alarm check seems to be stuck. Restart polling');
          clearTimeout(this.timeoutAlarm);
          this.lastAlarmCheck = null;
          this.pollAlarm();
        }
      }
      if (this.timeoutSensors) {
        if (this.lastSensorsCheck - now > 5 * this.getCheckFrequency()) {
          this.log.warn('Sensors check seems to be stuck. Restart polling');
          clearTimeout(this.timeoutSensors);
          this.lastSensorsCheck = null;
          yield src_1.sleep(1000); //give a second between calls
          this.pollSensors();
        }
      }
    });
  }
  pollSensors() {
    if (this.config.map_sensors) {
      this.timeoutSensors = setTimeout(
        () =>
          __awaiter(this, void 0, void 0, function*() {
            try {
              if (this.alarm) {
                this.log.debug('Check sensors status');
                this.lastAlarmCheck = Date.now();
                const zones = yield this.alarm.fetchZones();
                if (zones) {
                  this.log.debug(
                    `Found ${zones.length} areas: ${zones.map(a => a.description).join(', ')}`
                  );
                  zones.forEach(zone =>
                    this.mappedZones.find(z => z.name === zone.description).update(zone)
                  );
                } else {
                  this.log.warn('No zones found');
                }
              } else {
                this.log.warn('No areas found');
              }
            } catch (e) {
              this.log.error(`Polling error: ${e.message}`, e);
            } finally {
              polling.set({ service: 'sensors' }, 1);
              this.log.debug('Reset polling');
              this.timeoutSensors.refresh();
            }
          }),
        this.getCheckFrequency()
      );
    }
  }
  pollAlarm() {
    this.timeoutAlarm = setTimeout(
      () =>
        __awaiter(this, void 0, void 0, function*() {
          try {
            yield this.singleAreaCheck();
          } catch (e) {
            this.log.error(`Polling error: ${e.message}`, e);
          } finally {
            polling.set({ service: 'alarm' }, 1);
            this.log.debug('Reset polling');
            this.timeoutAlarm.refresh();
          }
        }),
      this.getCheckFrequency()
    );
  }
  singleAreaCheck() {
    return __awaiter(this, void 0, void 0, function*() {
      if (this.alarm) {
        this.log.debug('Check alarm status');
        this.lastAlarmCheck = Date.now();
        const alarmAreas = yield this.alarm.checkAlarm();
        if (alarmAreas) {
          this.log.debug(
            `Found ${alarmAreas.length} areas: ${alarmAreas.map(a => a.description).join(', ')}`
          );
          this.alarm.update(alarmAreas);
        } else {
          this.log.warn('No area found');
        }
      }
    });
  }
  discoverDevices() {
    return __awaiter(this, void 0, void 0, function*() {
      if (this.hasValidConfig()) {
        this.log.info(
          `Map VEDO alarm @ ${this.config.alarm_address}:${this.config.alarm_port || 80}`
        );
        const advanced = this.config.advanced || {};
        const area_mapping = this.config.area_mapping || {};
        const config = Object.assign(Object.assign({}, advanced), {
          away_areas: area_mapping.away_areas ? [...area_mapping.away_areas] : [],
          home_areas: area_mapping.home_areas ? [...area_mapping.home_areas] : [],
          night_areas: area_mapping.night_areas ? [...area_mapping.night_areas] : [],
        });
        const accessory = this.createHapAccessory('VEDO Alarm', 11 /* SECURITY_SYSTEM */);
        this.alarm = new vedo_alarm_1.VedoAlarm(
          this,
          accessory,
          this.config.alarm_address,
          this.config.alarm_port,
          this.config.alarm_code,
          config
        );
        if (this.config.map_sensors) {
          const zones = yield this.alarm.fetchZones();
          if (zones && zones.length) {
            this.mappedZones = zones.map(zone => {
              const name = `${zone.description}-${zone.index}`;
              this.log.info(`Mapping sensor with ID ${name}`);
              const sensorAccessory = this.createHapAccessory(name, 10 /* SENSOR */);
              return new vedo_sensor_1.VedoSensor(
                this,
                sensorAccessory,
                zone.description,
                zone,
                this.alarm
              );
            });
          }
        }
        yield this.singleAreaCheck();
        yield this.startPolling();
      } else {
        this.log.error('Invalid configuration ', this.config);
      }
    });
  }
  createHapAccessory(name, category) {
    const PlatformAccessory = this.homebridge.platformAccessory;
    const uuid = this.homebridge.hap.uuid.generate(name);
    const existingAccessory = this.accessories.get(uuid);
    const accessory = existingAccessory || new PlatformAccessory(name, uuid, category);
    if (existingAccessory) {
      this.log.info(`Reuse accessory from cache with uuid ${uuid}`);
    } else {
      this.log.info(`Registering new accessory with uuid ${uuid}`);
      this.homebridge.registerPlatformAccessories(
        constants_1.PLUGIN_IDENTIFIER,
        constants_1.PLATFORM_NAME,
        [accessory]
      );
    }
    return accessory;
  }
  hasValidConfig() {
    return this.config && this.config.alarm_address && this.config.alarm_code;
  }
  shutdown() {
    return __awaiter(this, void 0, void 0, function*() {
      clearInterval(this.timeoutSentinel);
      clearTimeout(this.timeoutAlarm);
      clearTimeout(this.timeoutSensors);
      return Promise.resolve(undefined);
    });
  }
}
exports.ComelitVedoPlatform = ComelitVedoPlatform;
//# sourceMappingURL=comelit-vedo-platform.js.map
