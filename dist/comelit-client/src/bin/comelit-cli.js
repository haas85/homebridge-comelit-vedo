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
const comelit_client_1 = require('../comelit-client');
const types_1 = require('../types');
const readline = require('readline');
const DEFAULT_BROKER_PASSWORD = 'sf1nE9bjPc';
const DEFAULT_BROKER_USER = 'hsrv-user';
const options = yargs
  .options({
    username: {
      description: 'Username to use when authenticating to the HUB',
      alias: 'u',
      type: 'string',
      demandOption: true,
      default: 'admin',
    },
    password: {
      description: 'Password to use when authenticating to the HUB',
      alias: 'p',
      type: 'string',
      demandOption: true,
      default: 'admin',
    },
    hub_username: {
      description: 'Username to use to connect MQTT broker',
      alias: 'bu',
      type: 'string',
      demandOption: true,
      default: DEFAULT_BROKER_USER,
    },
    hub_password: {
      description: 'Password to use to connect MQTT broker',
      alias: 'bp',
      type: 'string',
      demandOption: true,
      default: DEFAULT_BROKER_PASSWORD,
    },
    client_id: {
      description:
        'Client ID to use when connecting to the broker. Leave it empty to have the client generate it for you.',
      type: 'string',
      default: null,
    },
  })
  .command('scan', 'Find the HUB on your network')
  .command('info', 'Get info about a device', {
    host: {
      alias: 'h',
      description: 'broker host or IP',
      type: 'string',
      demandOption: false,
    },
    id: { type: 'string', demandOption: true },
    detail: { type: 'number', demandOption: false, default: 1 },
  })
  .command('params', 'Get HUB parameters', {
    host: { type: 'string', demandOption: false },
    username: {
      alias: 'u',
      type: 'string',
      demandOption: true,
      default: 'admin',
    },
    password: {
      alias: 'p',
      type: 'string',
      demandOption: true,
      default: 'admin',
    },
    broker_username: {
      alias: 'bu',
      type: 'string',
      demandOption: true,
      default: DEFAULT_BROKER_USER,
    },
    broker_password: {
      alias: 'bp',
      type: 'string',
      demandOption: true,
      default: DEFAULT_BROKER_PASSWORD,
    },
    client_id: { type: 'string', default: null },
  })
  .command('action', 'Send action to device', {
    host: {
      alias: 'h',
      description: 'broker host or IP',
      type: 'string',
      demandOption: false,
    },
    id: { type: 'string', demandOption: true },
    type: { type: 'number', demandOption: true, default: comelit_client_1.ACTION_TYPE.SET },
    value: { type: 'string', demandOption: true },
  })
  .command('zones', 'Get zones for a given parent zone', {
    host: {
      alias: 'h',
      description: 'broker host or IP',
      type: 'string',
      demandOption: false,
    },
    id: {
      description: 'ID of the parent room/zone',
      type: 'string',
      demandOption: true,
    },
  })
  .command('rooms', 'Get info about house rooms', {
    host: {
      alias: 'h',
      description: 'broker host or IP',
      type: 'string',
      demandOption: false,
    },
  })
  .command('lights', 'Get info about house lights', {
    host: {
      alias: 'h',
      description: 'broker host or IP',
      type: 'string',
      demandOption: false,
    },
    toggle: {
      describe: 'Turn on/off a light',
      type: 'string',
    },
  })
  .command('outlets', 'Get the list of all outlets in the house', {
    host: {
      alias: 'h',
      description: 'broker host or IP',
      type: 'string',
      demandOption: false,
    },
    toggle: {
      describe: 'Turn on/off an outlets',
      type: 'number',
    },
  })
  .command('shutters', 'Get the list of all shutters in the house', {
    host: {
      alias: 'h',
      description: 'broker host or IP',
      type: 'string',
      demandOption: false,
    },
    toggle: {
      describe: 'Open/close a shutter',
      type: 'number',
    },
  })
  .command('clima', 'Get the list of all thermostats/clima in the house', {
    host: {
      alias: 'h',
      description: 'broker host or IP',
      type: 'string',
      demandOption: false,
    },
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
  .command('umi', 'Get the list of all dehumidifiers in the house', {
    host: {
      alias: 'h',
      description: 'broker host or IP',
      type: 'string',
      demandOption: false,
    },
    toggle: {
      alias: 't',
      describe: 'Turn on/off a dehumidifier',
      type: 'number',
    },
    percentage: {
      alias: 'perc',
      describe: 'Set the threshold humidity for a dehumidifier',
      type: 'number',
    },
  })
  .command(
    'listen',
    'Optionally Subscribe to an object and listen on the read topic (CTRL+C to exit)',
    {
      host: {
        alias: 'h',
        description: 'broker host or IP',
        type: 'string',
        demandOption: false,
      },
      id: {
        type: 'string',
        demandOption: false,
        description: 'The ID of the object to subscribe to',
        default: comelit_client_1.ROOT_ID,
      },
      topic: {
        type: 'string',
        demandOption: false,
        description: 'The topic name to listen',
      },
    }
  )
  .demandCommand()
  .help().argv;
const client = new comelit_client_1.ComelitClient();
function run() {
  return __awaiter(this, void 0, void 0, function*() {
    const command = options._[0];
    console.log(chalk_1.default.green(`Executing command ${command}`));
    try {
      if (command === 'scan') {
        const devices = yield scan();
        devices.forEach(device =>
          console.log(
            `Found hardware ${device.hwID} MAC ${device.macAddress}, app ${device.appID} version ${device.appVersion}, system id ${device.systemID}, ${device.model} - ${device.description} at IP ${device.ip}`
          )
        );
      } else {
        yield client.init(options);
        yield client.login();
        const toggle = options.toggle;
        switch (command) {
          case 'info':
            yield info(options.id, options.detail);
            break;
          case 'params':
            yield params();
            break;
          case 'action':
            yield action(options.id, options.type, options.value);
            break;
          case 'zones':
            yield zones(options.id);
            break;
          case 'rooms':
            yield listRooms();
            break;
          case 'lights':
            if (toggle !== undefined) {
              switch (toggle) {
                case 'all-off':
                  yield listLights(light =>
                    __awaiter(this, void 0, void 0, function*() {
                      return yield client.toggleDeviceStatus(light.id, types_1.OFF);
                    })
                  );
                  break;
                case 'all-on':
                  yield listLights(light =>
                    __awaiter(this, void 0, void 0, function*() {
                      return yield client.toggleDeviceStatus(light.id, types_1.ON);
                    })
                  );
                  break;
                default:
                  yield Promise.all(
                    toggle.split(',').map(objID =>
                      __awaiter(this, void 0, void 0, function*() {
                        return toggleLight(objID.trim());
                      })
                    )
                  );
              }
            } else {
              yield listLights(printObj);
            }
            break;
          case 'outlets':
            if (toggle !== undefined) {
              yield toggleOutlets(toggle);
            } else {
              yield listOutlets();
            }
            break;
          case 'shutters':
            if (toggle !== undefined) {
              yield toggleShutter(toggle);
            } else {
              yield listShutters();
            }
            break;
          case 'clima':
            if (toggle !== undefined) {
              if (options.temp !== undefined) {
                yield setThermostatTemperature(toggle, options.temp);
              } else if (options.season !== undefined) {
                yield switchThermostatSeason(toggle, options.season);
              } else {
                yield switchThermostatState(toggle);
              }
            } else {
              yield listClima();
            }
            break;
          case 'umi':
            if (toggle !== undefined) {
              if (options.perc !== undefined) {
                yield setHumidifierTemperature(toggle, options.temp);
              } else {
                yield switchHumidifierState(toggle);
              }
            } else {
              yield listClima();
            }
            break;
          case 'listen':
            yield listen(options.id, options.topic);
            break;
          default:
            console.error(chalk_1.default.red(`Unknown command ${command}`));
        }
        console.log(chalk_1.default.green('Shutting down'));
        yield client.shutdown();
      }
      console.log(chalk_1.default.green(`Command ${command} executed successfully`));
    } catch (e) {
      console.error(e);
      yield client.shutdown();
    }
  });
}
function info(id, detailLevel = 1) {
  return __awaiter(this, void 0, void 0, function*() {
    console.log(chalk_1.default.green(`Getting device information for ${options.id}`));
    const data = yield client.device(id, detailLevel);
    console.log(JSON.stringify(data, null, 4));
  });
}
function params() {
  return __awaiter(this, void 0, void 0, function*() {
    console.log(chalk_1.default.green(`Getting parameters`));
    const data = yield client.readParameters();
    console.log(JSON.stringify(data, null, 4));
  });
}
function action(id, type, value) {
  return __awaiter(this, void 0, void 0, function*() {
    console.log(chalk_1.default.green(`Sending action ${type} with value ${value} to ${id}`));
    const data = yield client.sendAction(id, type, value);
    console.log(JSON.stringify(data, null, 4));
  });
}
function zones(id) {
  return __awaiter(this, void 0, void 0, function*() {
    console.log(chalk_1.default.green(`Retrieving zones for object ${id}`));
    const data = yield client.zones(id);
    console.log(JSON.stringify(data, null, 4));
  });
}
function listRooms() {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    [...homeIndex.roomsIndex.values()].forEach(room => {
      console.log(chalk_1.default.green(`${room.id} - ${room.descrizione}`));
    });
  });
}
function printObj(obj) {
  console.log(
    chalk_1.default.green(
      `${obj.objectId} - ${obj.descrizione} (status ${
        obj.status === types_1.STATUS_ON ? 'ON' : 'OFF'
      })`
    )
  );
}
function listLights(fn) {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    return [...homeIndex.lightsIndex.values()].forEach(light => {
      return fn(light);
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
function toggleLight(index) {
  return __awaiter(this, void 0, void 0, function*() {
    const lightDeviceData = yield client.device(index);
    if (lightDeviceData) {
      if (lightDeviceData.status === types_1.STATUS_OFF) {
        return client.toggleDeviceStatus(index, types_1.ON);
      } else {
        return client.toggleDeviceStatus(index, types_1.OFF);
      }
    } else {
      console.log(chalk_1.default.red('Selected light does not exists'));
    }
  });
}
function toggleOutlets(index) {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    const otherDeviceData = homeIndex.get(index);
    if (otherDeviceData) {
      if (otherDeviceData.status === types_1.STATUS_OFF) {
        yield client.toggleDeviceStatus(index, types_1.ON);
      } else {
        yield client.toggleDeviceStatus(index, types_1.OFF);
      }
    } else {
      console.log(chalk_1.default.red('Selected outlet does not exists'));
    }
  });
}
function toggleShutter(index) {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    const blindDeviceData = homeIndex.get(index);
    if (blindDeviceData) {
      if (blindDeviceData.status === types_1.STATUS_OFF) {
        yield client.toggleDeviceStatus(index, types_1.ON);
      } else {
        yield client.toggleDeviceStatus(index, types_1.OFF);
      }
    } else {
      console.log(chalk_1.default.red('Selected shutter does not exists'));
    }
  });
}
function switchThermostatState(index) {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    const climaDeviceData = homeIndex.get(index);
    if (climaDeviceData) {
      switch (climaDeviceData.auto_man) {
        case comelit_client_1.ClimaMode.OFF_AUTO:
          yield client.switchThermostatMode(index, comelit_client_1.ClimaMode.AUTO);
          break;
        case comelit_client_1.ClimaMode.OFF_MANUAL:
          yield client.switchThermostatMode(index, comelit_client_1.ClimaMode.MANUAL);
          break;
        case comelit_client_1.ClimaMode.MANUAL:
        case comelit_client_1.ClimaMode.AUTO:
          yield client.toggleThermostatStatus(index, comelit_client_1.ClimaOnOff.OFF);
          break;
      }
    }
  });
}
function switchThermostatSeason(index, season) {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    const climaDeviceData = homeIndex.get(index);
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
      const climaDeviceData = homeIndex.get(index);
      if (climaDeviceData) {
        yield client.setTemperature(index, temp * 10);
      }
    } catch (e) {
      console.log(chalk_1.default.red(e.message));
    }
  });
}
function switchHumidifierState(index) {
  return __awaiter(this, void 0, void 0, function*() {
    const homeIndex = yield client.fetchHomeIndex();
    const climaDeviceData = homeIndex.get(index);
    if (climaDeviceData) {
      switch (climaDeviceData.auto_man_umi) {
        case comelit_client_1.ClimaMode.OFF_AUTO:
          yield client.switchHumidifierMode(index, comelit_client_1.ClimaMode.AUTO);
          break;
        case comelit_client_1.ClimaMode.OFF_MANUAL:
          yield client.switchHumidifierMode(index, comelit_client_1.ClimaMode.MANUAL);
          break;
        case comelit_client_1.ClimaMode.MANUAL:
        case comelit_client_1.ClimaMode.AUTO:
          yield client.toggleHumidifierStatus(index, comelit_client_1.ClimaOnOff.OFF_HUMI);
          break;
      }
    }
  });
}
function setHumidifierTemperature(index, temperature) {
  return __awaiter(this, void 0, void 0, function*() {
    try {
      const temp = parseFloat(temperature);
      const homeIndex = yield client.fetchHomeIndex();
      const climaDeviceData = homeIndex.get(index);
      if (climaDeviceData) {
        yield client.setHumidity(index, temp);
      }
    } catch (e) {
      console.log(chalk_1.default.red(e.message));
    }
  });
}
function scan() {
  return __awaiter(this, void 0, void 0, function*() {
    console.log(chalk_1.default.green('Scanning local network for HUB...'));
    return yield client.scan();
  });
}
function listen(id, topic) {
  return __awaiter(this, void 0, void 0, function*() {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    console.log(chalk_1.default.green(`Subscribing to object ${id}`));
    if (id) {
      yield client.subscribeObject(id);
    }
    if (topic) {
      yield client.subscribeTopic(topic, (topic, message) => {
        console.log(chalk_1.default.blue(`Received message on topic ${topic}`));
        console.log(chalk_1.default.blue(message));
      });
    }
    console.log(chalk_1.default.green(`Listening...(press CTRL+c to interrupt)`));
    return new Promise(resolve => {
      process.stdin.on('keypress', (str, key) =>
        __awaiter(this, void 0, void 0, function*() {
          if (key.ctrl && key.name === 'c') {
            resolve();
          }
        })
      );
    });
  });
}
run().then(() => {
  console.log(chalk_1.default.green('Exiting'));
  process.exit(0);
});
//# sourceMappingURL=comelit-cli.js.map
