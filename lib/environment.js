// used to prevent webpack from resolving requires on node libs

// determines the JavaScript platform: browser or node
module.exports.platform = __PLATFORM__;
// determines whether the code is running in main thread or not
module.exports.isMainThread = module.exports.platform === 'browser' ? typeof Window !== 'undefined' : !process.connected;

// determines the number of cpus available

if(__PLATFORM__ === 'browser'){
  module.exports.cpus = self.navigator.hardwareConcurrency;
} else {
  module.exports.cpus = require('os').cpus().length;
}
