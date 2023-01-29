#!/usr/bin/env node
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
const yargs = require('yargs');
const chalk_1 = __importDefault(require('chalk'));
const comelit_sb_client_1 = require('../comelit-sb-client');
const types_1 = require('../types');
const comelit_client_1 = require('../comelit-client');
const options = yargs
  .option('host', { alias: 'h', type: 'string', demandOption: true })
  .option('port', {
    alias: 'p',
    type: 'number',
    demandOption: false,
    default: 80,
  })
  .command('rooms', 'Get the list of all rooms in the house')
  .command('lights', 'Get the list of all lights in the house', {
    toggle: {
      describe: 'Turn on/off a light',
      type: 'number',
    },
  })
  .command('outlets', 'Get the list of all outlets in the house', {
    toggle: {
      describe: 'Turn on/off an outlets',
      type: 'number',
    },
  })
  .command('shutters', 'Get the list of all shutters in the house', {
    toggle: {
      describe: 'Open/close a shutter',
      type: 'number',
    },
  })
  .command('clima', 'Get the list of all thermostats/clima in the house', {
    toggle: {
      describe: 'Turn on/off a thermostat',
      type: 'number',
    },
    temp: {
      describe: 'Set the temperature for a thermostat',
      type: 'string',
    },
    season: {
      describe: 'Set the season for a thermostat',
      type: 'string',
      choices: ['winter', 'summer'],
    },
  })
  .demandCommand(1, 1)
  .help().argv;
let client = null;
function listLights() {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    [...homeIndex.lightsIndex.values()].forEach(light => {
      let subtype = 'Unknown light type';
      switch (light.sub_type) {
        case types_1.OBJECT_SUBTYPE.DIGITAL_LIGHT:
          subtype = 'Digital light';
          break;
        case types_1.OBJECT_SUBTYPE.TEMPORIZED_LIGHT:
          subtype = 'Temporized light';
          break;
        case types_1.OBJECT_SUBTYPE.RGB_LIGHT:
          subtype = 'RGB light';
          break;
      }
      console.log(
        chalk_1.default.green(
          `${light.objectId} - ${light.descrizione} (status ${
            light.status === types_1.STATUS_ON ? 'ON' : 'OFF'
          } (${subtype})`
        )
      );
    });
  });
}
function listOutlets() {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    [...homeIndex.outletsIndex.values()].forEach(outlet => {
      console.log(
        chalk_1.default.green(
          `${outlet.objectId} - ${outlet.descrizione} (status ${
            outlet.status === types_1.STATUS_ON ? 'ON' : 'OFF'
          })`
        )
      );
    });
  });
}
function listShutters() {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    [...homeIndex.blindsIndex.values()].forEach(blind => {
      console.log(
        chalk_1.default.green(
          `${blind.objectId} - ${blind.descrizione} (status ${
            blind.status === types_1.STATUS_ON ? 'DOWN' : 'UP'
          })`
        )
      );
    });
  });
}
function listClima() {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    [...homeIndex.thermostatsIndex.values()].forEach(clima => {
      const auto_man = clima.auto_man;
      const isOff =
        auto_man === comelit_client_1.ClimaMode.OFF_AUTO ||
        auto_man === comelit_client_1.ClimaMode.OFF_MANUAL;
      const isManual =
        auto_man === comelit_client_1.ClimaMode.OFF_MANUAL ||
        auto_man === comelit_client_1.ClimaMode.MANUAL;
      console.log(
        chalk_1.default.green(
          `${clima.objectId} - ${clima.descrizione}:\nThermostat status ${isOff ? 'OFF' : 'ON'}, ${
            isManual ? 'manual mode' : 'auto mode'
          }, ${
            clima.est_inv === comelit_client_1.ThermoSeason.WINTER ? 'winter' : 'summer'
          }, Temperature ${parseInt(clima.temperatura) / 10}°, threshold ${parseInt(
            clima.soglia_attiva
          ) / 10}°`
        )
      );
      const humi_auto_man = clima.auto_man_umi;
      const humi_isOff =
        humi_auto_man === comelit_client_1.ClimaMode.OFF_AUTO ||
        humi_auto_man === comelit_client_1.ClimaMode.OFF_MANUAL;
      const humi_isManual =
        humi_auto_man === comelit_client_1.ClimaMode.OFF_MANUAL ||
        humi_auto_man === comelit_client_1.ClimaMode.MANUAL;
      console.log(
        chalk_1.default.blue(
          `Dehumidifier status is ${humi_isOff ? 'OFF' : 'ON'}, ${
            humi_isManual ? 'manual mode' : 'auto mode'
          }, Humidity level ${parseInt(clima.umidita)}%, threshold ${
            clima.soglia_attiva_umi
          }%\nGeneral status is ${clima.status === '1' ? 'ON' : 'OFF'}\n`
        )
      );
    });
  });
}
function listRooms() {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    [...homeIndex.roomsIndex.values()].forEach(room => {
      console.log(chalk_1.default.green(`${room.objectId} - ${room.descrizione}`));
    });
  });
}
function toggleLight(index) {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    const lightDeviceData = homeIndex.get(comelit_sb_client_1.getLightKey(index));
    if (lightDeviceData) {
      if (lightDeviceData.status === types_1.STATUS_OFF) {
        yield client.toggleDeviceStatus(index, types_1.ON, 'light');
      } else {
        yield client.toggleDeviceStatus(index, types_1.OFF, 'light');
      }
    } else {
      console.log(chalk_1.default.red('Selected light does not exists'));
    }
  });
}
function toggleOutlets(index) {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    const otherDeviceData = homeIndex.get(comelit_sb_client_1.getOtherKey(index));
    if (otherDeviceData) {
      if (otherDeviceData.status === types_1.STATUS_OFF) {
        yield client.toggleDeviceStatus(index, types_1.ON, 'other');
      } else {
        yield client.toggleDeviceStatus(index, types_1.OFF, 'other');
      }
    } else {
      console.log(chalk_1.default.red('Selected outlet does not exists'));
    }
  });
}
function toggleShutter(index) {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    const blindDeviceData = homeIndex.get(comelit_sb_client_1.getBlindKey(index));
    if (blindDeviceData) {
      if (blindDeviceData.status === types_1.STATUS_OFF) {
        yield client.toggleDeviceStatus(index, types_1.ON, 'shutter');
      } else {
        yield client.toggleDeviceStatus(index, types_1.OFF, 'shutter');
      }
    } else {
      console.log(chalk_1.default.red('Selected shutter does not exists'));
    }
  });
}
function switchThermostatState(index) {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    const climaDeviceData = homeIndex.get(comelit_sb_client_1.getClimaKey(index));
    if (climaDeviceData) {
      switch (climaDeviceData.auto_man) {
        case comelit_client_1.ClimaMode.OFF_AUTO:
          yield client.switchThermostatMode(index, comelit_client_1.ClimaMode.AUTO);
          break;
        case comelit_client_1.ClimaMode.OFF_MANUAL:
          yield client.switchThermostatMode(index, comelit_client_1.ClimaMode.MANUAL);
          break;
        case comelit_client_1.ClimaMode.AUTO:
          yield client.switchThermostatMode(index, comelit_client_1.ClimaMode.OFF_AUTO);
          break;
        case comelit_client_1.ClimaMode.MANUAL:
          yield client.switchThermostatMode(index, comelit_client_1.ClimaMode.OFF_MANUAL);
          break;
      }
    }
  });
}
function switchThermostatSeason(index, season) {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    const climaDeviceData = homeIndex.get(comelit_sb_client_1.getClimaKey(index));
    if (climaDeviceData) {
      yield client.switchThermostatSeason(
        index,
        season === 'summer'
          ? comelit_client_1.ThermoSeason.SUMMER
          : comelit_client_1.ThermoSeason.WINTER
      );
    }
  });
}
function setThermostatTemperature(index, temperature) {
  return __awaiter(this, void 0, void 0, function*() {
    try {
      const temp = parseFloat(temperature);
      const homeIndex = yield client.fetchHomeIndex();
      const climaDeviceData = homeIndex.get(comelit_sb_client_1.getClimaKey(index));
      if (climaDeviceData) {
        yield client.setTemperature(index, temp * 10);
      }
    } catch (e) {
      console.log(chalk_1.default.red(e.message));
    }
  });
}
function run() {
  return __awaiter(this, void 0, void 0, function*() {
    const command = options._[0];
    console.log(chalk_1.default.green(`Executing command ${command} - ${JSON.stringify(options)}`));
    client = new comelit_sb_client_1.ComelitSbClient(options.host, options.port);
    yield client.login();
    try {
      switch (command) {
        case 'lights':
          if (options.toggle !== undefined) {
            yield toggleLight(options.toggle);
          } else {
            yield listLights();
          }
          break;
        case 'outlets':
          if (options.toggle !== undefined) {
            yield toggleOutlets(options.toggle);
          } else {
            yield listOutlets();
          }
          break;
        case 'shutters':
          if (options.toggle !== undefined) {
            yield toggleShutter(options.toggle);
          } else {
            yield listShutters();
          }
          break;
        case 'clima':
          if (options.toggle !== undefined) {
            if (options.temp !== undefined) {
              yield setThermostatTemperature(options.toggle, options.temp);
            } else if (options.season !== undefined) {
              yield switchThermostatSeason(options.toggle, options.season);
            } else {
              yield switchThermostatState(options.toggle);
            }
          } else {
            yield listClima();
          }
          break;
        case 'rooms':
          yield listRooms();
          break;
        default:
          console.error(chalk_1.default.red(`Unknown command ${command}`));
          process.exit(1);
      }
      console.log(chalk_1.default.green('Shutting down'));
      yield client.shutdown();
      console.log(chalk_1.default.green(`Command ${command} executed successfully`));
    } catch (e) {
      console.error(e);
      yield client.shutdown();
    }
  });
}
run().then(() => {
  console.log(chalk_1.default.green('Exiting'));
  process.exit(0);
});
//# sourceMappingURL=comelit-sb-cli.js.map
