// used to prevent webpack from resolving requires on node libs
var node = {require: require};

function isElectron() {
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true;
  } else if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
    return true;
  } else if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
    return true;
  }
  return false;
}

function isBrowser() {
  if(typeof window !== 'undefined')
    return true;
  else if(typeof WorkerGlobalScope !== 'undefined')
    return true;
}

// determines the JavaScript platform: browser or node
module.exports.platform = isElectron()
  ? 'node'
  : isBrowser()
    ? 'browser'
    : 'node';

// determines whether the code is running in main thread or not
module.exports.isMainThread = module.exports.platform === 'browser' ? typeof Window !== 'undefined' : !process.connected;

// determines the number of cpus available
module.exports.cpus = module.exports.platform === 'browser'
  ? self.navigator.hardwareConcurrency
  : node.require('os').cpus().length;  // call node.require to prevent `os` to be required when loading with AMD
