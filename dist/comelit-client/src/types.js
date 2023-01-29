'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.HomeIndex = exports.STATUS_OFF = exports.STATUS_ON = exports.IDLE = exports.OFF = exports.ON = exports.OBJECT_SUBTYPE = exports.OBJECT_TYPE = void 0;
var OBJECT_TYPE;
(function(OBJECT_TYPE) {
  OBJECT_TYPE[(OBJECT_TYPE['BLIND'] = 2)] = 'BLIND';
  OBJECT_TYPE[(OBJECT_TYPE['LIGHT'] = 3)] = 'LIGHT';
  OBJECT_TYPE[(OBJECT_TYPE['THERMOSTAT'] = 9)] = 'THERMOSTAT';
  OBJECT_TYPE[(OBJECT_TYPE['OUTLET'] = 10)] = 'OUTLET';
  OBJECT_TYPE[(OBJECT_TYPE['POWER_SUPPLIER'] = 11)] = 'POWER_SUPPLIER';
  OBJECT_TYPE[(OBJECT_TYPE['ZONE'] = 1001)] = 'ZONE';
})((OBJECT_TYPE = exports.OBJECT_TYPE || (exports.OBJECT_TYPE = {})));
var OBJECT_SUBTYPE;
(function(OBJECT_SUBTYPE) {
  OBJECT_SUBTYPE[(OBJECT_SUBTYPE['GENERIC'] = 0)] = 'GENERIC';
  OBJECT_SUBTYPE[(OBJECT_SUBTYPE['DIGITAL_LIGHT'] = 1)] = 'DIGITAL_LIGHT';
  OBJECT_SUBTYPE[(OBJECT_SUBTYPE['RGB_LIGHT'] = 2)] = 'RGB_LIGHT';
  OBJECT_SUBTYPE[(OBJECT_SUBTYPE['TEMPORIZED_LIGHT'] = 3)] = 'TEMPORIZED_LIGHT';
  OBJECT_SUBTYPE[(OBJECT_SUBTYPE['DIMMER_LIGHT'] = 4)] = 'DIMMER_LIGHT';
  OBJECT_SUBTYPE[(OBJECT_SUBTYPE['ELECTRIC_BLIND'] = 7)] = 'ELECTRIC_BLIND';
  OBJECT_SUBTYPE[(OBJECT_SUBTYPE['CLIMA_TERM'] = 12)] = 'CLIMA_TERM';
  OBJECT_SUBTYPE[(OBJECT_SUBTYPE['GENERIC_ZONE'] = 13)] = 'GENERIC_ZONE';
  OBJECT_SUBTYPE[(OBJECT_SUBTYPE['CONSUMPTION'] = 15)] = 'CONSUMPTION';
  OBJECT_SUBTYPE[(OBJECT_SUBTYPE['CLIMA_THERMOSTAT_DEHUMIDIFIER'] = 16)] =
    'CLIMA_THERMOSTAT_DEHUMIDIFIER';
  OBJECT_SUBTYPE[(OBJECT_SUBTYPE['CLIMA_DEHUMIDIFIER'] = 17)] = 'CLIMA_DEHUMIDIFIER';
})((OBJECT_SUBTYPE = exports.OBJECT_SUBTYPE || (exports.OBJECT_SUBTYPE = {})));
exports.ON = 1;
exports.OFF = 0;
exports.IDLE = 2;
exports.STATUS_ON = '1';
exports.STATUS_OFF = '0';
class HomeIndex {
  constructor(home) {
    this.lightsIndex = new Map();
    this.roomsIndex = new Map();
    this.thermostatsIndex = new Map();
    this.blindsIndex = new Map();
    this.outletsIndex = new Map();
    this.supplierIndex = new Map();
    this.mainIndex = new Map();
    home.elements.forEach(info => {
      this.visitElement(info);
    });
  }
  get(id) {
    return this.mainIndex.get(id);
  }
  updateObject(id, data) {
    if (this.mainIndex.has(id)) {
      const deviceData = this.mainIndex.get(id);
      const value = Object.assign(Object.assign({}, deviceData), data);
      this.mainIndex.set(id, Object.freeze(value));
      return value;
    }
    return null;
  }
  visitElement(element) {
    switch (element.data.type) {
      case OBJECT_TYPE.LIGHT:
        this.lightsIndex.set(element.id, element.data);
        break;
      case OBJECT_TYPE.ZONE:
        this.roomsIndex.set(element.id, element.data);
        break;
      case OBJECT_TYPE.THERMOSTAT:
        this.thermostatsIndex.set(element.id, element.data);
        break;
      case OBJECT_TYPE.BLIND:
        this.blindsIndex.set(element.id, element.data);
        break;
      case OBJECT_TYPE.OUTLET:
        this.outletsIndex.set(element.id, element.data);
        break;
      case OBJECT_TYPE.POWER_SUPPLIER:
        this.supplierIndex.set(element.id, element.data);
        break;
    }
    if (this.mainIndex.has(element.id)) {
      console.warn(`Overwriting element with key ${element.id} in index!`);
    }
    this.mainIndex.set(element.id, element.data);
    if (element.data.elements) {
      element.data.elements.forEach(value => this.visitElement(value));
    }
  }
}
exports.HomeIndex = HomeIndex;
//# sourceMappingURL=types.js.map
