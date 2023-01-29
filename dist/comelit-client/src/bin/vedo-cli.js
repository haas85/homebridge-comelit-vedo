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
Object.defineProperty(exports, '__esModule', { value: true });
const yargs = require('yargs');
const chalk = require('chalk');
const vedo_client_1 = require('../vedo-client');
const options = yargs
  .scriptName('vedo')
  .option('host', { alias: 'h', type: 'string', demandOption: true })
  .option('code', { alias: 'c', type: 'string', demandOption: true })
  .option('port', { alias: 'p', type: 'number', demandOption: false })
  .command('area', 'Get info about active areas', {
    desc: {
      describe: 'Get info about areas status',
    },
    status: {
      describe: 'Get info about active areas',
    },
    active: {
      describe: 'Get active areas',
    },
    arm: {
      describe: 'Arm a specific area',
      type: 'number',
    },
    disarm: {
      describe: 'Arm a specific area',
      type: 'number',
    },
  })
  .command('zone', 'Get info about active zones', {
    desc: {
      describe: 'Get info about zones status',
    },
    status: {
      describe: 'Get info about active zones',
    },
    exclude: {
      describe: 'Exclude given zone',
    },
    include: {
      describe: 'Include given zone',
    },
  })
  .demandCommand()
  .help().argv;
let client = null;
function run() {
  return __awaiter(this, void 0, void 0, function*() {
    const command = options._[0];
    console.log(chalk.green(`Executing command ${command} - ${JSON.stringify(options)}`));
    client = new vedo_client_1.VedoClient(options.host, options.port || 80);
    let uid = null;
    try {
      uid = yield client.loginWithRetry(options.code); // this will throw an error if the system cannot login
      switch (command) {
        case 'area':
          if (options.desc) {
            yield areaDesc(uid);
          }
          if (options.status) {
            yield areaStatus(uid);
          }
          if (options.active) {
            yield activeAreas(uid);
          }
          if (options.arm !== undefined) {
            yield armArea(uid, options.arm);
          } else if (options.disarm !== undefined) {
            yield disarmArea(uid, options.disarm);
          }
          break;
        case 'zone':
          if (options.desc) {
            yield zoneDesc(uid);
          }
          if (options.status) {
            yield zoneStatus(uid);
          }
          if (options.include) {
            yield includeZone(uid, options.include);
          }
          if (options.exclude) {
            yield excludeZone(uid, options.exclude);
          }
          break;
        default:
          console.error(chalk.red(`Unknown command ${command}`));
          process.exit(1);
      }
      console.log(chalk.green('Shutting down'));
      yield client.shutdown(uid);
      console.log(chalk.green(`Command ${command} executed successfully`));
    } catch (e) {
      console.error(e.message);
      if (uid) {
        yield client.shutdown(uid);
      }
    }
  });
}
function areaDesc(uid) {
  return __awaiter(this, void 0, void 0, function*() {
    const desc = yield client.areaDesc(uid);
    console.log(desc);
  });
}
function zoneDesc(uid) {
  return __awaiter(this, void 0, void 0, function*() {
    const desc = yield client.zoneDesc(uid);
    console.log(desc);
  });
}
function areaStatus(uid) {
  return __awaiter(this, void 0, void 0, function*() {
    const stats = yield client.areaStatus(uid);
    console.log(stats);
  });
}
function zoneStatus(uid) {
  return __awaiter(this, void 0, void 0, function*() {
    const stats = yield client.zoneStatus(uid);
    console.log(stats);
  });
}
function activeAreas(uid) {
  return __awaiter(this, void 0, void 0, function*() {
    const desc = yield client.findActiveAreas(uid);
    console.log(desc);
  });
}
function armArea(uid, num = 32) {
  return __awaiter(this, void 0, void 0, function*() {
    const areas = yield client.findActiveAreas(uid);
    const isReady = areas.reduce((prev, area) => prev && area.ready, true);
    if (isReady) {
      return yield client.arm(uid, num);
    }
    return Promise.reject(new Error('Area not ready'));
  });
}
function disarmArea(uid, num = 32) {
  return __awaiter(this, void 0, void 0, function*() {
    return yield client.disarm(uid, num);
  });
}
function includeZone(uid, include) {
  return __awaiter(this, void 0, void 0, function*() {
    return yield client.includeZone(uid, include);
  });
}
function excludeZone(uid, include) {
  return __awaiter(this, void 0, void 0, function*() {
    return yield client.excludeZone(uid, include);
  });
}
run().then(() => {
  console.log(chalk.green('Exiting'));
  process.exit(0);
});
//# sourceMappingURL=vedo-cli.js.map
