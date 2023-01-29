'use strict';
const comelit_vedo_platform_1 = require('./comelit-vedo-platform');
const constants_1 = require('./constants');
module.exports = api => {
  api.registerPlatform(
    constants_1.PLUGIN_IDENTIFIER,
    constants_1.PLATFORM_NAME,
    comelit_vedo_platform_1.ComelitVedoPlatform
  );
};
//# sourceMappingURL=index.js.map
