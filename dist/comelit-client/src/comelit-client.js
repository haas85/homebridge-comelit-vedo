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
exports.ComelitClient = exports.DEFAULT_SEND_DELAY = exports.ObjectStatus = exports.ClimaOnOff = exports.ClimaMode = exports.ThermoSeason = exports.ACTION_TYPE = exports.REQUEST_SUB_TYPE = exports.REQUEST_TYPE = exports.ROOT_ID = void 0;
const async_mqtt_1 = __importDefault(require('async-mqtt'));
const promise_queue_1 = require('./promise-queue');
const utils_1 = require('./utils');
const dgram_1 = __importDefault(require('dgram'));
const types_1 = require('./types');
exports.ROOT_ID = 'GEN#17#13#1';
const connectAsync = async_mqtt_1.default.connectAsync;
const CLIENT_ID_PREFIX = 'HSrv';
const SCAN_PORT = 24199;
var REQUEST_TYPE;
(function(REQUEST_TYPE) {
  REQUEST_TYPE[(REQUEST_TYPE['STATUS'] = 0)] = 'STATUS';
  REQUEST_TYPE[(REQUEST_TYPE['ACTION'] = 1)] = 'ACTION';
  REQUEST_TYPE[(REQUEST_TYPE['SUBSCRIBE'] = 3)] = 'SUBSCRIBE';
  REQUEST_TYPE[(REQUEST_TYPE['LOGIN'] = 5)] = 'LOGIN';
  REQUEST_TYPE[(REQUEST_TYPE['PING'] = 7)] = 'PING';
  REQUEST_TYPE[(REQUEST_TYPE['READ_PARAMS'] = 8)] = 'READ_PARAMS';
  REQUEST_TYPE[(REQUEST_TYPE['GET_DATETIME'] = 9)] = 'GET_DATETIME';
  REQUEST_TYPE[(REQUEST_TYPE['ANNOUNCE'] = 13)] = 'ANNOUNCE';
})((REQUEST_TYPE = exports.REQUEST_TYPE || (exports.REQUEST_TYPE = {})));
var REQUEST_SUB_TYPE;
(function(REQUEST_SUB_TYPE) {
  REQUEST_SUB_TYPE[(REQUEST_SUB_TYPE['CREATE_OBJ'] = 0)] = 'CREATE_OBJ';
  REQUEST_SUB_TYPE[(REQUEST_SUB_TYPE['UPDATE_OBJ'] = 1)] = 'UPDATE_OBJ';
  REQUEST_SUB_TYPE[(REQUEST_SUB_TYPE['DELETE_OBJ'] = 2)] = 'DELETE_OBJ';
  REQUEST_SUB_TYPE[(REQUEST_SUB_TYPE['SET_ACTION_OBJ'] = 3)] = 'SET_ACTION_OBJ';
  REQUEST_SUB_TYPE[(REQUEST_SUB_TYPE['GET_TEMPO_OBJ'] = 4)] = 'GET_TEMPO_OBJ';
  REQUEST_SUB_TYPE[(REQUEST_SUB_TYPE['SUBSCRIBE_RT'] = 5)] = 'SUBSCRIBE_RT';
  REQUEST_SUB_TYPE[(REQUEST_SUB_TYPE['UNSUBSCRIBE_RT'] = 6)] = 'UNSUBSCRIBE_RT';
  REQUEST_SUB_TYPE[(REQUEST_SUB_TYPE['GET_CONF_PARAM_GROUP'] = 23)] = 'GET_CONF_PARAM_GROUP';
  REQUEST_SUB_TYPE[(REQUEST_SUB_TYPE['NONE'] = -1)] = 'NONE';
})((REQUEST_SUB_TYPE = exports.REQUEST_SUB_TYPE || (exports.REQUEST_SUB_TYPE = {})));
var ACTION_TYPE;
(function(ACTION_TYPE) {
  ACTION_TYPE[(ACTION_TYPE['SET'] = 0)] = 'SET';
  ACTION_TYPE[(ACTION_TYPE['CLIMA_MODE'] = 1)] = 'CLIMA_MODE';
  ACTION_TYPE[(ACTION_TYPE['CLIMA_SET_POINT'] = 2)] = 'CLIMA_SET_POINT';
  ACTION_TYPE[(ACTION_TYPE['SWITCH_SEASON'] = 4)] = 'SWITCH_SEASON';
  ACTION_TYPE[(ACTION_TYPE['SWITCH_CLIMA_MODE'] = 13)] = 'SWITCH_CLIMA_MODE';
  ACTION_TYPE[(ACTION_TYPE['UMI_SETPOINT'] = 19)] = 'UMI_SETPOINT';
  ACTION_TYPE[(ACTION_TYPE['SWITCH_UMI_MODE'] = 23)] = 'SWITCH_UMI_MODE';
})((ACTION_TYPE = exports.ACTION_TYPE || (exports.ACTION_TYPE = {})));
var ThermoSeason;
(function(ThermoSeason) {
  ThermoSeason['SUMMER'] = '0';
  ThermoSeason['WINTER'] = '1';
})((ThermoSeason = exports.ThermoSeason || (exports.ThermoSeason = {})));
var ClimaMode;
(function(ClimaMode) {
  ClimaMode['NONE'] = '0';
  ClimaMode['AUTO'] = '1';
  ClimaMode['MANUAL'] = '2';
  ClimaMode['SEMI_AUTO'] = '3';
  ClimaMode['SEMI_MAN'] = '4';
  ClimaMode['OFF_AUTO'] = '5';
  ClimaMode['OFF_MANUAL'] = '6';
})((ClimaMode = exports.ClimaMode || (exports.ClimaMode = {})));
var ClimaOnOff;
(function(ClimaOnOff) {
  ClimaOnOff[(ClimaOnOff['OFF_THERMO'] = 0)] = 'OFF_THERMO';
  ClimaOnOff[(ClimaOnOff['ON_THERMO'] = 1)] = 'ON_THERMO';
  ClimaOnOff[(ClimaOnOff['OFF_HUMI'] = 2)] = 'OFF_HUMI';
  ClimaOnOff[(ClimaOnOff['ON_HUMI'] = 3)] = 'ON_HUMI';
  ClimaOnOff[(ClimaOnOff['OFF'] = 4)] = 'OFF';
  ClimaOnOff[(ClimaOnOff['ON'] = 5)] = 'ON';
})((ClimaOnOff = exports.ClimaOnOff || (exports.ClimaOnOff = {})));
var ObjectStatus;
(function(ObjectStatus) {
  ObjectStatus[(ObjectStatus['NONE'] = -1)] = 'NONE';
  ObjectStatus[(ObjectStatus['OFF'] = 0)] = 'OFF';
  ObjectStatus[(ObjectStatus['ON'] = 1)] = 'ON';
  ObjectStatus[(ObjectStatus['IDLE'] = 2)] = 'IDLE';
  ObjectStatus[(ObjectStatus['ON_DEHUMIDIFY'] = 4)] = 'ON_DEHUMIDIFY';
  ObjectStatus[(ObjectStatus['UP'] = 7)] = 'UP';
  ObjectStatus[(ObjectStatus['DOWN'] = 8)] = 'DOWN';
  ObjectStatus[(ObjectStatus['OPEN'] = 9)] = 'OPEN';
  ObjectStatus[(ObjectStatus['CLOSE'] = 10)] = 'CLOSE';
  ObjectStatus[(ObjectStatus['ON_COOLING'] = 11)] = 'ON_COOLING';
})((ObjectStatus = exports.ObjectStatus || (exports.ObjectStatus = {})));
function deserializeMessage(message) {
  const parsed = JSON.parse(message.toString());
  parsed.status = parseInt(parsed.status);
  return parsed;
}
function bytesToHex(byteArray) {
  return byteArray.reduce((output, elem) => output + ('0' + elem.toString(16)).slice(-2), '');
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_TIMEOUT = 5000;
exports.DEFAULT_SEND_DELAY = 500;
class ComelitClient extends promise_queue_1.PromiseBasedQueue {
  constructor(onUpdate, log) {
    super();
    this.props = {
      client: null,
      index: 1,
    };
    this.onUpdate = onUpdate;
    this.logger = log || console;
  }
  static evalResponse(response) {
    if (response.req_result === 0) {
      console.debug(`Resolving response ${response.seq_id}`);
      return true;
    }
    console.error(response.message);
    throw new Error(response.message);
  }
  consume(response) {
    const deferredMqttMessage = response.seq_id ? this.findInQueue(response) : null;
    if (deferredMqttMessage) {
      this.queuedMessages.splice(this.queuedMessages.indexOf(deferredMqttMessage), 1);
      if (response.req_result === 0) {
        this.logger.debug(`Resolving promise ${response.seq_id}:`, response);
        deferredMqttMessage.promise.resolve(response);
      } else {
        this.logger.error(`Rejecting promise ${response.seq_id}:`, response);
        deferredMqttMessage.promise.reject(response);
      }
      return true;
    } else {
      if (response.obj_id && response.out_data && response.out_data.length && this.homeIndex) {
        const datum = response.out_data[0];
        const oldValue = Object.freeze(this.homeIndex.get(response.obj_id));
        const value = Object.freeze(this.homeIndex.updateObject(response.obj_id, datum));
        if (this.onUpdate && value) {
          this.logger.info(`Updating ${response.obj_id} with data ${JSON.stringify(datum)}`);
          this.onUpdate(response.obj_id, value, oldValue);
        }
      }
    }
    return false;
  }
  findInQueue(message) {
    return this.queuedMessages.find(
      m => m.message.seq_id == message.seq_id && m.message.req_type == message.req_type
    );
  }
  isLogged() {
    return !!this.props.sessiontoken;
  }
  scan() {
    return new Promise(resolve => {
      const devices = [];
      const server = dgram_1.default.createSocket('udp4');
      let timeout;
      function sendScan() {
        const message = Buffer.alloc(12);
        message.write('SCAN');
        message.writeInt32BE(0x00000000, 4);
        message.writeInt32BE(0x00ffffff, 8);
        server.send(message, SCAN_PORT, '255.255.255.255');
      }
      function sendInfo(address) {
        const message = Buffer.alloc(12);
        message.write('INFO');
        server.send(message, address.port, address.address);
      }
      server.bind(() => {
        server.setBroadcast(true);
        sendScan();
        timeout = setTimeout(() => {
          resolve(devices);
        }, 1000);
      });
      server.on('listening', () => {
        const address = server.address();
        this.logger.debug(`Server listening ${address.address}:${address.port}`);
      });
      server.on('error', err => {
        this.logger.error(`server error:\n${err.stack}`);
        clearInterval(timeout);
        server.close();
        resolve(devices);
      });
      server.on('message', (msg, rinfo) => {
        if (msg.toString().startsWith('here')) {
          sendInfo(rinfo);
        } else {
          const device = {
            macAddress: bytesToHex(msg.subarray(14, 20)),
            hwID: msg.subarray(20, 24).toString(),
            appID: msg.subarray(24, 28).toString(),
            appVersion: msg.subarray(32, 112).toString(),
            systemID: msg.subarray(112, 116).toString(),
            description: msg.subarray(116, 152).toString(),
            modelID: msg.subarray(156, 160).toString(),
            ip: rinfo.address,
          };
          let model = device.modelID;
          switch (device.modelID) {
            case 'Extd':
              model = '1456 - Gateway';
              break;
            case 'ExtS':
              model = '1456S - Gateway';
              break;
            case 'MSVF':
              model = '6741W - Mini SBC/ViP/Extender handsfree';
              break;
            case 'MSVU':
              model = '6741W - Mini SBC/ViP/Extender handsfree';
              break;
            case 'MnWi':
              model = '6742W - Mini ViP handsfree Wifi';
              break;
            case 'MxWi':
              model = "6842W - Maxi ViP 7'' Wifi";
              break;
            case 'Vist':
              model = 'Visto - Wifi ViP';
              break;
            case 'HSrv':
              model = 'Home server';
              break;
          }
          device.model = model;
          devices.push(device);
        }
      });
    });
  }
  getMACAddress(config) {
    return __awaiter(this, void 0, void 0, function*() {
      return new Promise((resolve, reject) => {
        const server = dgram_1.default.createSocket('udp4');
        const message = Buffer.alloc(12);
        message.write('INFO');
        server.send(
          message,
          SCAN_PORT,
          config.host.indexOf('://') !== -1
            ? config.host.substr(config.host.indexOf('://') + 3)
            : config.host
        );
        server.on('message', msg => {
          const macAddress = bytesToHex(msg.subarray(14, 20));
          server.close();
          resolve(macAddress.toUpperCase());
        });
        server.on('error', err => {
          this.logger.info(`server error:\n${err.stack}`);
          server.close();
          reject();
        });
      });
    });
  }
  init(config) {
    return __awaiter(this, void 0, void 0, function*() {
      let broker;
      let macAddress;
      if (config.host) {
        broker = config.host.indexOf('://') !== -1 ? config.host : `mqtt://${config.host}`;
        macAddress = yield this.getMACAddress(config);
      } else {
        this.logger.info('Searching for Comelit HUB on LAN...');
        const devices = yield this.scan();
        const hub = devices.find(device => device.appID === 'HSrv');
        if (hub) {
          this.logger.info(
            `Found Comelit HUB at ${hub.ip} (MAC ${hub.macAddress}, Name ${hub.description})`
          );
          broker = `mqtt://${hub.ip}`;
          macAddress = hub.macAddress.toUpperCase();
        } else {
          throw new Error(
            'Unable to find Comelit HUB on local network. If you know the IP, please use it in the configuration'
          );
        }
      }
      this.username = config.username;
      this.password = config.password;
      this.clientId = this.getOrCreateClientId(config.clientId);
      this.rxTopic = `${CLIENT_ID_PREFIX}/${macAddress}/rx/${this.clientId}`;
      this.txTopic = `${CLIENT_ID_PREFIX}/${macAddress}/tx/${this.clientId}`;
      this.logger.info(
        `Connecting to Comelit HUB at ${broker} with clientID ${
          this.clientId
        } (user: ${config.hub_username || 'hsrv-user'}, pwd ${config.hub_password || 'sf1nE9bjPc'})`
      );
      this.props.client = yield connectAsync(broker, {
        username: config.hub_username || 'hsrv-user',
        password: config.hub_password || 'sf1nE9bjPc',
        clientId: config.clientId || CLIENT_ID_PREFIX,
        keepalive: 120,
        rejectUnauthorized: false,
      });
      // Register to incoming messages
      yield this.subscribeTopic(this.txTopic, this.handleIncomingMessage.bind(this));
      this.setTimeout(DEFAULT_TIMEOUT);
      this.props.agent_id = yield this.retrieveAgentId();
      this.logger.info(`...done: client agent id is ${this.props.agent_id}`);
      return this.props.client;
    });
  }
  subscribeTopic(topic, handler) {
    return __awaiter(this, void 0, void 0, function*() {
      yield this.props.client.subscribe(topic);
      this.props.client.on('message', handler);
    });
  }
  shutdown() {
    return __awaiter(this, void 0, void 0, function*() {
      if (this.props.client && this.props.client.connected) {
        try {
          this.flush(true);
          this.logger.info('Comelit client unsubscribe from read topic');
          yield this.props.client.unsubscribe(this.rxTopic);
          this.logger.info('Comelit client ending session');
          yield this.props.client.end(true);
        } catch (e) {
          this.logger.info(e.message);
        }
      }
      this.props.client = null;
      this.props.index = 0;
      this.props.sessiontoken = null;
      this.props.agent_id = null;
      this.logger.info('Comelit client disconnected');
    });
  }
  login() {
    return __awaiter(this, void 0, void 0, function*() {
      if (!this.props.agent_id) {
        throw new Error('You must initialize the client before calling login');
      }
      const packet = {
        req_type: REQUEST_TYPE.LOGIN,
        seq_id: this.props.index++,
        req_sub_type: REQUEST_SUB_TYPE.NONE,
        agent_type: 0,
        agent_id: this.props.agent_id,
        user_name: this.username,
        password: this.password,
      };
      try {
        const response = yield this.publish(packet);
        this.props.sessiontoken = response.sessiontoken;
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    });
  }
  readParameters() {
    return __awaiter(this, void 0, void 0, function*() {
      const packet = {
        req_type: REQUEST_TYPE.READ_PARAMS,
        seq_id: this.props.index++,
        req_sub_type: REQUEST_SUB_TYPE.GET_CONF_PARAM_GROUP,
        param_type: 2,
        agent_type: 0,
        agent_id: this.props.agent_id,
        sessiontoken: this.props.sessiontoken,
      };
      const response = yield this.publish(packet);
      ComelitClient.evalResponse(response);
      return [...response.params_data];
    });
  }
  subscribeObject(id) {
    return __awaiter(this, void 0, void 0, function*() {
      const packet = {
        req_type: REQUEST_TYPE.SUBSCRIBE,
        seq_id: this.props.index++,
        req_sub_type: REQUEST_SUB_TYPE.SUBSCRIBE_RT,
        sessiontoken: this.props.sessiontoken,
        obj_id: id,
      };
      const response = yield this.publish(packet);
      return ComelitClient.evalResponse(response);
    });
  }
  ping() {
    return __awaiter(this, void 0, void 0, function*() {
      const packet = {
        req_type: REQUEST_TYPE.PING,
        seq_id: this.props.index++,
        req_sub_type: REQUEST_SUB_TYPE.NONE,
        sessiontoken: this.props.sessiontoken,
      };
      const response = yield this.publish(packet);
      return ComelitClient.evalResponse(response);
    });
  }
  device(objId = exports.ROOT_ID, detailLevel) {
    return __awaiter(this, void 0, void 0, function*() {
      const packet = {
        req_type: REQUEST_TYPE.STATUS,
        seq_id: this.props.index++,
        req_sub_type: REQUEST_SUB_TYPE.NONE,
        sessiontoken: this.props.sessiontoken,
        obj_id: objId,
        detail_level: detailLevel || 1,
      };
      const response = yield this.publish(packet);
      ComelitClient.evalResponse(response);
      return response.out_data[0];
    });
  }
  zones(objId) {
    return __awaiter(this, void 0, void 0, function*() {
      const packet = {
        req_type: REQUEST_TYPE.STATUS,
        seq_id: this.props.index++,
        req_sub_type: REQUEST_SUB_TYPE.NONE,
        sessiontoken: this.props.sessiontoken,
        obj_id: objId,
        obj_type: 1000,
        detail_level: 1,
      };
      const response = yield this.publish(packet);
      ComelitClient.evalResponse(response);
      return response.out_data[0];
    });
  }
  fetchHomeIndex() {
    return __awaiter(this, void 0, void 0, function*() {
      const root = yield this.device(exports.ROOT_ID);
      return this.mapHome(root);
    });
  }
  toggleDeviceStatus(id, status) {
    return __awaiter(this, void 0, void 0, function*() {
      return this.sendAction(id, ACTION_TYPE.SET, status);
    });
  }
  setTemperature(id, temperature) {
    return __awaiter(this, void 0, void 0, function*() {
      return this.sendAction(id, ACTION_TYPE.CLIMA_SET_POINT, temperature);
    });
  }
  switchThermostatMode(id, mode) {
    return __awaiter(this, void 0, void 0, function*() {
      return this.sendAction(id, ACTION_TYPE.SWITCH_CLIMA_MODE, parseInt(mode));
    });
  }
  switchThermostatSeason(id, mode) {
    return __awaiter(this, void 0, void 0, function*() {
      return this.sendAction(id, ACTION_TYPE.SWITCH_SEASON, parseInt(mode));
    });
  }
  setHumidity(id, humidity) {
    return __awaiter(this, void 0, void 0, function*() {
      return this.sendAction(id, ACTION_TYPE.UMI_SETPOINT, humidity);
    });
  }
  switchHumidifierMode(id, mode) {
    return __awaiter(this, void 0, void 0, function*() {
      return this.sendAction(id, ACTION_TYPE.SWITCH_UMI_MODE, parseInt(mode));
    });
  }
  toggleHumidifierStatus(id, mode) {
    return __awaiter(this, void 0, void 0, function*() {
      return this.sendAction(id, ACTION_TYPE.SET, mode);
    });
  }
  toggleThermostatStatus(id, mode) {
    return __awaiter(this, void 0, void 0, function*() {
      return this.sendAction(id, ACTION_TYPE.SET, mode);
    });
  }
  sendAction(id, type, value) {
    return __awaiter(this, void 0, void 0, function*() {
      const packet = {
        req_type: REQUEST_TYPE.ACTION,
        seq_id: this.props.index++,
        req_sub_type: REQUEST_SUB_TYPE.SET_ACTION_OBJ,
        act_type: type,
        sessiontoken: this.props.sessiontoken,
        obj_id: id,
        act_params: [value],
      };
      yield utils_1.sleep(exports.DEFAULT_SEND_DELAY);
      const response = yield this.publish(packet);
      return ComelitClient.evalResponse(response);
    });
  }
  mapHome(home) {
    this.homeIndex = new types_1.HomeIndex(home);
    return this.homeIndex;
  }
  getOrCreateClientId(clientId) {
    if (this.clientId) {
      // We already generated a client id, reuse it
      return this.clientId;
    }
    return clientId
      ? `${CLIENT_ID_PREFIX}_${clientId}`
      : `${CLIENT_ID_PREFIX}_${utils_1.generateUUID(`${Math.random()}`).toUpperCase()}`;
  }
  retrieveAgentId() {
    return __awaiter(this, void 0, void 0, function*() {
      this.logger.info('Retrieving agent id...');
      const packet = {
        req_type: REQUEST_TYPE.ANNOUNCE,
        seq_id: this.props.index++,
        req_sub_type: REQUEST_SUB_TYPE.NONE,
        agent_type: 0,
      };
      const msg = yield this.publish(packet);
      const agentId = msg.out_data[0].agent_id;
      const desc = msg.out_data[0].descrizione;
      this.logger.info(`Logged into Comelit hub: ${desc}`);
      return agentId;
    });
  }
  publish(packet) {
    this.logger.info(`Sending message to HUB ${JSON.stringify(packet)}`);
    return this.props.client
      .publish(this.rxTopic, JSON.stringify(packet))
      .then(() => this.enqueue(packet))
      .catch(response => {
        this.logger.error('Error while sending packet');
        if (response.req_result === 1 && response.message === 'invalid token') {
          return this.login().then(() => this.publish(packet)); // relogin and override invalid token
        }
        if (response.message.indexOf('Timeout') > 0) {
          return this.publish(packet);
        }
        throw response;
      });
  }
  handleIncomingMessage(topic, message) {
    const msg = deserializeMessage(message);
    this.logger.debug(`Received message with id ${msg.seq_id}`);
    if (topic === this.txTopic) {
      this.processQueue(msg);
    } else {
      console.error(`Unknown topic ${topic}, message ${msg.toString()}`);
    }
  }
}
exports.ComelitClient = ComelitClient;
//# sourceMappingURL=comelit-client.js.map
