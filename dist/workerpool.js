(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("child_process"), require("os"));
	else if(typeof define === 'function' && define.amd)
		define(["child_process", "os"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("child_process"), require("os")) : factory(root["child_process"], root["os"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_9__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Promise
 *
 * Inspired by https://gist.github.com/RubaXa/8501359 from RubaXa <trash@rubaxa.org>
 *
 * @param {Function} handler   Called as handler(resolve: Function, reject: Function)
 * @param {Promise} [parent]   Parent promise for propagation of cancel and timeout
 */
function Promise(handler, parent) {
  var me = this;

  if (!(this instanceof Promise)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (typeof handler !== 'function') {
    throw new SyntaxError('Function parameter handler(resolve, reject) missing');
  }

  var _onSuccess = [];
  var _onFail = [];

  // status
  this.resolved = false;
  this.rejected = false;
  this.pending = true;

  /**
   * Process onSuccess and onFail callbacks: add them to the queue.
   * Once the promise is resolve, the function _promise is replace.
   * @param {Function} onSuccess
   * @param {Function} onFail
   * @private
   */
  var _process = function (onSuccess, onFail) {
    _onSuccess.push(onSuccess);
    _onFail.push(onFail);
  };

  /**
   * Add an onSuccess callback and optionally an onFail callback to the Promise
   * @param {Function} onSuccess
   * @param {Function} [onFail]
   * @returns {Promise} promise
   */
  this.then = function (onSuccess, onFail) {
    return new Promise(function (resolve, reject) {
      var s = onSuccess ? _then(onSuccess, resolve, reject) : resolve;
      var f = onFail    ? _then(onFail,    resolve, reject) : reject;

      _process(s, f);
    }, me);
  };

  /**
   * Resolve the promise
   * @param {*} result
   * @type {Function}
   */
  var _resolve = function (result) {
    // update status
    me.resolved = true;
    me.rejected = false;
    me.pending = false;

    _onSuccess.forEach(function (fn) {
      fn(result);
    });

    _process = function (onSuccess, onFail) {
      onSuccess(result);
    };

    _resolve = _reject = function () {
      throw new Error('Promise is already resolved');
    };

    return me;
  };

  /**
   * Reject the promise
   * @param {Error} error
   * @type {Function}
   */
  var _reject = function (error) {
    // update status
    me.resolved = false;
    me.rejected = true;
    me.pending = false;

    _onFail.forEach(function (fn) {
      fn(error);
    });

    _process = function (onSuccess, onFail) {
      onFail(error);
    };

    _resolve = _reject = function () {
      throw new Error('Promise is already resolved');
    };

    return me;
  };

  /**
   * Cancel te promise. This will reject the promise with a CancellationError
   * @returns {Promise} self
   */
  this.cancel = function () {
    if (parent) {
      parent.cancel();
    }
    else {
      _reject(new CancellationError());
    }

    return me;
  };

  /**
   * Set a timeout for the promise. If the promise is not resolved within
   * the time, the promise will be cancelled and a TimeoutError is thrown.
   * If the promise is resolved in time, the timeout is removed.
   * @param {number} delay     Delay in milliseconds
   * @returns {Promise} self
   */
  this.timeout = function (delay) {
    if (parent) {
      parent.timeout(delay);
    }
    else {
      var timer = setTimeout(function () {
        _reject(new TimeoutError('Promise timed out after ' + delay + ' ms'));
      }, delay);

      me.always(function () {
        clearTimeout(timer);
      });
    }

    return me;
  };

  // attach handler passing the resolve and reject functions
  handler(function (result) {
    _resolve(result);
  }, function (error) {
    _reject(error);
  });
}

/**
 * Execute given callback, then call resolve/reject based on the returned result
 * @param {Function} callback
 * @param {Function} resolve
 * @param {Function} reject
 * @returns {Function}
 * @private
 */
function _then(callback, resolve, reject) {
  return function (result) {
    try {
      var res = callback(result);
      if (res && typeof res.then === 'function' && typeof res['catch'] === 'function') {
        // method returned a promise
        res.then(resolve, reject);
      }
      else {
        resolve(res);
      }
    }
    catch (error) {
      reject(error);
    }
  }
}

/**
 * Add an onFail callback to the Promise
 * @param {Function} onFail
 * @returns {Promise} promise
 */
Promise.prototype['catch'] = function (onFail) {
  return this.then(null, onFail);
};

// TODO: add support for Promise.catch(Error, callback)
// TODO: add support for Promise.catch(Error, Error, callback)

/**
 * Execute given callback when the promise either resolves or rejects.
 * @param {Function} fn
 * @returns {Promise} promise
 */
Promise.prototype.always = function (fn) {
  return this.then(fn, fn);
};

/**
 * Create a promise which resolves when all provided promises are resolved,
 * and fails when any of the promises resolves.
 * @param {Promise[]} promises
 * @returns {Promise} promise
 */
Promise.all = function (promises){
  return new Promise(function (resolve, reject) {
    var remaining = promises.length,
        results = [];

    if (remaining) {
      promises.forEach(function (p, i) {
        p.then(function (result) {
          results[i] = result;
          remaining--;
          if (remaining == 0) {
            resolve(results);
          }
        }, function (error) {
          remaining = 0;
          reject(error);
        });
      });
    }
    else {
      resolve(results);
    }
  });
};

/**
 * Create a promise resolver
 * @returns {{promise: Promise, resolve: Function, reject: Function}} resolver
 */
Promise.defer = function () {
  var resolver = {};

  resolver.promise = new Promise(function (resolve, reject) {
    resolver.resolve = resolve;
    resolver.reject = reject;
  });

  return resolver;
};

/**
 * Create a cancellation error
 * @param {String} [message]
 * @extends Error
 */
function CancellationError(message) {
  this.message = message || 'promise cancelled';
  this.stack = (new Error()).stack;
}

CancellationError.prototype = new Error();
CancellationError.prototype.constructor = Error;
CancellationError.prototype.name = 'CancellationError';

Promise.CancellationError = CancellationError;


/**
 * Create a timeout error
 * @param {String} [message]
 * @extends Error
 */
function TimeoutError(message) {
  this.message = message || 'timeout exceeded';
  this.stack = (new Error()).stack;
}

TimeoutError.prototype = new Error();
TimeoutError.prototype.constructor = Error;
TimeoutError.prototype.name = 'TimeoutError';

Promise.TimeoutError = TimeoutError;


module.exports = Promise;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

// used to prevent webpack from resolving requires on node libs

// determines the JavaScript platform: browser or node
module.exports.platform = "node";
// determines whether the code is running in main thread or not
module.exports.isMainThread = module.exports.platform === 'browser' ? typeof Window !== 'undefined' : !process.connected;

// determines the number of cpus available

if(false){
  module.exports.cpus = self.navigator.hardwareConcurrency;
} else {
  module.exports.cpus = __webpack_require__(9).cpus().length;
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var Promise = __webpack_require__(0);
var WorkerHandler = __webpack_require__(5);
var environment = __webpack_require__(1);

/**
 * A pool to manage workers
 * @param {String} [script]   Optional worker script
 * @param {Object} [options]  Available options: maxWorkers: Number
 * @constructor
 */
function Pool(script, options) {
  if (typeof script === 'string') {
    this.script = script || null;
  }
  else {
    this.script = null;
    options = script;
  }

  this.workers = [];  // queue with all workers
  this.tasks = [];    // queue with tasks awaiting execution

  options = options || {};

  this.forkArgs = options.forkArgs || [];
  this.forkOpts = options.forkOpts || {};
  this.debugPortStart = options.debugPortStart || 43210;

  // configuration
  if (options && 'maxWorkers' in options) {
    validateMaxWorkers(options.maxWorkers);
    this.maxWorkers = options.maxWorkers;
  }
  else {
    this.maxWorkers = Math.max((environment.cpus || 4) - 1, 1);
  }

  if (options && 'minWorkers' in options) {
    if(options.minWorkers === 'max') {
      this.minWorkers = Math.max((environment.cpus || 4) - 1, 1);
    } else {
      validateMinWorkers(options.minWorkers);
      this.minWorkers = options.minWorkers;
      this.maxWorkers = Math.max(this.minWorkers, this.maxWorkers);     // in case minWorkers is higher than maxWorkers
    }
    this._ensureMinWorkers();
  }
}

/**
 * Execute a function on a worker.
 *
 * Example usage:
 *
 *   var pool = new Pool()
 *
 *   // call a function available on the worker
 *   pool.exec('fibonacci', [6])
 *
 *   // offload a function
 *   function add(a, b) {
 *     return a + b
 *   };
 *   pool.exec(add, [2, 4])
 *       .then(function (result) {
 *         console.log(result); // outputs 6
 *       })
 *       .catch(function(error) {
 *         console.log(error);
 *       });
 *
 * @param {String | Function} method  Function name or function.
 *                                    If `method` is a string, the corresponding
 *                                    method on the worker will be executed
 *                                    If `method` is a Function, the function
 *                                    will be stringified and executed via the
 *                                    workers built-in function `run(fn, args)`.
 * @param {Array} [params]  Function arguments applied when calling the function
 * @return {Promise.<*, Error>} result
 */
Pool.prototype.exec = function (method, params) {
  // validate type of arguments
  if (params && !Array.isArray(params)) {
    throw new TypeError('Array expected as argument "params"');
  }

  if (typeof method === 'string') {
    var resolver = Promise.defer();

    // add a new task to the queue
    var tasks = this.tasks;
    var task = {
      method:  method,
      params:  params,
      resolver: resolver,
      timeout: null
    };
    tasks.push(task);

    // replace the timeout method of the Promise with our own,
    // which starts the timer as soon as the task is actually started
    var originalTimeout = resolver.promise.timeout
    resolver.promise.timeout = function timeout (delay) {
      if (tasks.indexOf(task) !== -1) {
        // task is still queued -> start the timer later on
        task.timeout = delay;
        return resolver.promise;
      }
      else {
        // task is already being executed -> start timer immediately
        return originalTimeout.call(resolver.promise, delay);
      }
    }

    // trigger task execution
    this._next();

    return resolver.promise;
  }
  else if (typeof method === 'function') {
    // send stringified function and function arguments to worker
    return this.exec('run', [String(method), params]);
  }
  else {
    throw new TypeError('Function or string expected as argument "method"');
  }
};

/**
 * Create a proxy for current worker. Returns an object containing all
 * methods available on the worker. The methods always return a promise.
 *
 * @return {Promise.<Object, Error>} proxy
 */
Pool.prototype.proxy = function () {
  if (arguments.length > 0) {
    throw new Error('No arguments expected');
  }

  var pool = this;
  return this.exec('methods')
      .then(function (methods) {
        var proxy = {};

        methods.forEach(function (method) {
          proxy[method] = function () {
            return pool.exec(method, Array.prototype.slice.call(arguments));
          }
        });

        return proxy;
      });
};

/**
 * Creates new array with the results of calling a provided callback function
 * on every element in this array.
 * @param {Array} array
 * @param {function} callback  Function taking two arguments:
 *                             `callback(currentValue, index)`
 * @return {Promise.<Array>} Returns a promise which resolves  with an Array
 *                           containing the results of the callback function
 *                           executed for each of the array elements.
 */
/* TODO: implement map
Pool.prototype.map = function (array, callback) {
};
*/

/**
 * Grab the first task from the queue, find a free worker, and assign the
 * worker to the task.
 * @protected
 */
Pool.prototype._next = function () {
  if (this.tasks.length > 0) {
    // there are tasks in the queue

    // find an available worker
    var worker = this._getWorker();
    if (worker) {
      // get the first task from the queue
      var me = this;
      var task = this.tasks.shift();

      // check if the task is still pending (and not cancelled -> promise rejected)
      if (task.resolver.promise.pending) {
        // send the request to the worker
        var promise = worker.exec(task.method, task.params, task.resolver)
          .then(function () {
            me._next(); // trigger next task in the queue
          })
          .catch(function () {
            // if the worker crashed and terminated, remove it from the pool
            if (worker.terminated) {
              me._removeWorker(worker);
              // If minWorkers set, spin up new workers to replace the crashed ones
              me._ensureMinWorkers();
            }
            me._next(); // trigger next task in the queue
          });

        // start queued timer now
        if (typeof task.timeout === 'number') {
          promise.timeout(task.timeout);
        }
      }
    }
  }
};

/**
 * Get an available worker. If no worker is available and the maximum number
 * of workers isn't yet reached, a new worker will be created and returned.
 * If no worker is available and the maximum number of workers is reached,
 * null will be returned.
 *
 * @return {WorkerHandler | null} worker
 * @private
 */
Pool.prototype._getWorker = function() {
  // find a non-busy worker
  for (var i = 0, ii = this.workers.length; i < ii; i++) {
    var worker = this.workers[i];
    if (!worker.busy()) {
      return worker;
    }
  }

  if (this.workers.length < this.maxWorkers) {
    // create a new worker
    worker = new WorkerHandler(this.script, {
      forkArgs: this.forkArgs,
      forkOpts: this.forkOpts,
      debugPort: this.debugPortStart + this.workers.length
    });
    this.workers.push(worker);
    return worker;
  }

  return null;
};

/**
 * Remove a worker from the pool. For example after a worker terminated for
 * whatever reason
 * @param {WorkerHandler} worker
 * @protected
 */
Pool.prototype._removeWorker = function(worker) {
  // terminate the worker (if not already terminated)
  worker.terminate();
  this._removeWorkerFromList(worker);
};

/**
 * Remove a worker from the pool list.
 * @param {WorkerHandler} worker
 * @protected
 */
Pool.prototype._removeWorkerFromList = function(worker) {
  // remove from the list with workers
  var index = this.workers.indexOf(worker);
  if (index != -1) {
    this.workers.splice(index, 1);
  }
};

/**
 * Close all active workers. Tasks currently being executed will be finished first.
 * @param {boolean} [force=false]   If false (default), the workers are terminated
 *                                  after finishing all tasks currently in
 *                                  progress. If true, the workers will be
 *                                  terminated immediately.
 * @param {number} [timeout]        If provided and non-zero, worker termination promise will be rejected
 *                                  after timeout if worker process has not been terminated.
 * @return {Promise.<void, Error>}
 */
Pool.prototype.terminate = function (force, timeout) {
  var f = function (worker) {
    this._removeWorkerFromList(worker);
  };
  var removeWorker = f.bind(this);

  var promises = [];
  var workers = this.workers.slice();
  workers.forEach(function (worker) {
    var termPromise = worker.terminateAndNotify(force, timeout)
      .then(removeWorker);
    promises.push(termPromise);
  });
  return Promise.all(promises);
};

// DEPRECATED
/**
 * Close all active workers. Unlike terminate, this function does not return a promise.
 * @param force
 */
Pool.prototype.clear = function (force) {
  this.terminate(force);
};

/**
 * Retrieve statistics on tasks and workers.
 * @return {{totalWorkers: number, busyWorkers: number, idleWorkers: number, pendingTasks: number, activeTasks: number}} Returns an object with statistics
 */
Pool.prototype.stats = function () {
  var totalWorkers = this.workers.length;
  var busyWorkers = this.workers.filter(function (worker) {
    return worker.busy();
  }).length;

  return {
    totalWorkers:  totalWorkers,
    busyWorkers:   busyWorkers,
    idleWorkers:   totalWorkers - busyWorkers,

    pendingTasks:  this.tasks.length,
    activeTasks:   busyWorkers
  };
};

/**
 * Ensures that a minimum of minWorkers is up and running
 * @protected
 */
Pool.prototype._ensureMinWorkers = function() {
  if (this.minWorkers) {
    for(var i = this.workers.length; i < this.minWorkers; i++) {
      this.workers.push(new WorkerHandler(this.script, {
        forkArgs: this.forkArgs,
        forkOpts: this.forkOpts,
        debugPort: this.debugPortStart + i
      }));
    }
  }
};

/**
 * Ensure that the maxWorkers option is an integer >= 1
 * @param {*} maxWorkers
 * @returns {boolean} returns true maxWorkers has a valid value
 */
function validateMaxWorkers(maxWorkers) {
  if (!isNumber(maxWorkers) || !isInteger(maxWorkers) || maxWorkers < 1) {
    throw new TypeError('Option maxWorkers must be an integer number >= 1');
  }
}

/**
 * Ensure that the minWorkers option is an integer >= 0
 * @param {*} minWorkers
 * @returns {boolean} returns true when minWorkers has a valid value
 */
function validateMinWorkers(minWorkers) {
  if (!isNumber(minWorkers) || !isInteger(minWorkers) || minWorkers < 0) {
    throw new TypeError('Option minWorkers must be an integer number >= 0');
  }
}

/**
 * Test whether a variable is a number
 * @param {*} value
 * @returns {boolean} returns true when value is a number
 */
function isNumber(value) {
  return typeof value === 'number';
}

/**
 * Test whether a number is an integer
 * @param {number} value
 * @returns {boolean} Returns true if value is an integer
 */
function isInteger(value) {
  return Math.round(value) == value;
}

module.exports = Pool;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * worker must be started as a child process or a web worker.
 * It listens for RPC messages from the parent process.
 */

// create a worker API for sending and receiving messages which works both on
// node.js and in the browser
var worker = {};
if (typeof self !== 'undefined' && typeof postMessage === 'function' && typeof addEventListener === 'function') {
  // worker in the browser
  worker.on = function (event, callback) {
    addEventListener(event, function (message) {
      callback(message.data);
    })
  };
  worker.send = function (message) {
    postMessage(message);
  };
}
else if (typeof process !== 'undefined') {
  // node.js
  worker.on = process.on.bind(process);
  worker.send = process.send.bind(process);
}
else {
  throw new Error('Script must be executed as a worker');
}

function convertError(error) {
  return Object.getOwnPropertyNames(error).reduce(function(product, name) {
    return Object.defineProperty(product, name, {
	value: error[name],
	enumerable: true
    });
  }, {});
}

/**
 * Test whether a value is a Promise via duck typing.
 * @param {*} value
 * @returns {boolean} Returns true when given value is an object
 *                    having functions `then` and `catch`.
 */
function isPromise(value) {
  return value && (typeof value.then === 'function') && (typeof value.catch === 'function');
}

// functions available externally
worker.methods = {};

/**
 * Execute a function with provided arguments
 * @param {String} fn     Stringified function
 * @param {Array} [args]  Function arguments
 * @returns {*}
 */
worker.methods.run = function run(fn, args) {
  var f = eval('(' + fn + ')');
  return f.apply(f, args);
};

/**
 * Get a list with methods available on this worker
 * @return {String[]} methods
 */
worker.methods.methods = function methods() {
  return Object.keys(worker.methods);
};

worker.on('message', function (request) {
  try {
    var method = worker.methods[request.method];

    if (method) {
      // execute the function
      var result = method.apply(method, request.params);

      if (isPromise(result)) {
        // promise returned, resolve this and then return
        result
            .then(function (result) {
              worker.send({
                id: request.id,
                result: result,
                error: null
              });
            })
            .catch(function (err) {
              worker.send({
                id: request.id,
                result: null,
                error: convertError(err)
              });
            });
      }
      else {
        // immediate result
        worker.send({
          id: request.id,
          result: result,
          error: null
        });
      }
    }
    else {
      throw new Error('Unknown method "' + request.method + '"');
    }
  }
  catch (err) {
    worker.send({
      id: request.id,
      result: null,
      error: convertError(err)
    });
  }
});

/**
 * Register methods to the worker
 * @param {Object} methods
 */
worker.register = function (methods) {

  if (methods) {
    for (var name in methods) {
      if (methods.hasOwnProperty(name)) {
        worker.methods[name] = methods[name];
      }
    }
  }

  worker.send('ready');

};

if (true) {
  exports.add = worker.register;
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var environment = __webpack_require__(1);

/**
 * Create a new worker pool
 * @param {Object} [options]
 * @returns {Pool} pool
 */
exports.pool = function pool(script, options) {
  var Pool = __webpack_require__(2);

  return new Pool(script, options);
};

/**
 * Create a worker and optionally register a set of methods to the worker.
 * @param {Object} [methods]
 */
exports.worker = function worker(methods) {
  var worker = __webpack_require__(3);
  worker.add(methods);
};

/**
 * Create a promise.
 * @type {Promise} promise
 */
exports.Promise = __webpack_require__(0);

exports.platform = environment.platform;
exports.isMainThread = environment.isMainThread;
exports.cpus = environment.cpus;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var Promise = __webpack_require__(0);
var assign = __webpack_require__(7);

// determine environment
var environment = __webpack_require__(1);

// get the default worker script
function getDefaultWorker() {
  if (environment.platform == 'browser') {
    // test whether the browser supports all features that we need
    if (typeof Blob === 'undefined') {
      throw new Error('Blob not supported by the browser');
    }
    if (!window.URL || typeof window.URL.createObjectURL !== 'function') {
      throw new Error('URL.createObjectURL not supported by the browser');
    }

    // use embedded worker.js
    var blob = new Blob([__webpack_require__(6)], {type: 'text/javascript'});
    return window.URL.createObjectURL(blob);
  }
  else {
    // use external worker.js in current directory
    return __dirname + '/worker.js';
  }
}

// add debug flags to child processes if the node inspector is active
function resolveForkOptions(opts) {
  opts = opts || {};

  var processExecArgv = process.execArgv.join(' ');
  var inspectorActive = processExecArgv.indexOf('--inspect') !== -1;
  var debugBrk = processExecArgv.indexOf('--debug-brk') !== -1;

  var execArgv = [];
  if (inspectorActive) {
    execArgv.push('--inspect=' + opts.debugPort);

    if (debugBrk) {
      execArgv.push('--debug-brk');
    }
  }

  return assign({}, opts, {
    forkArgs: opts.forkArgs,
    forkOpts: assign({}, opts.forkOpts, {
      execArgv: (opts.forkOpts && opts.forkOpts.execArgv || [])
        .concat(execArgv)
    })
  });
}

/**
 * Converts a serialized error to Error
 * @param {Object} obj Error that has been serialized and parsed to object
 * @return {Error} The equivalent Error.
 */
function objectToError (obj) {
  var temp = new Error('')
  var props = Object.keys(obj)

  for (var i = 0; i < props.length; i++) {
    temp[props[i]] = obj[props[i]]
  }

  return temp
}

/**
 * A WorkerHandler controls a single worker. This worker can be a child process
 * on node.js or a WebWorker in a browser environment.
 * @param {String} [script] If no script is provided, a default worker with a
 *                          function run will be created.
 * @constructor
 */
function WorkerHandler(script, options) {
  this.script = script || getDefaultWorker();

  var forkOptions;

  if (false) {
    // check whether Worker is supported by the browser
    // Workaround for a bug in PhantomJS (Or QtWebkit): https://github.com/ariya/phantomjs/issues/14534
    if (typeof Worker !== 'function' && (typeof Worker !== 'object' || typeof Worker.prototype.constructor !== 'function')) {
      throw new Error('Web workers not supported by the browser');
    }

    // create the web worker
    this.worker = new Worker(this.script);

    // add node.js API to the web worker
    this.worker.on = function (event, callback) {
      this.addEventListener(event, function (message) {
        callback(message.data);
      });
    };
    this.worker.send = function (message) {
      this.postMessage(message);
    };
  }
  else {
    // on node.js, create a child process
    forkOptions = resolveForkOptions(options);

    // call node.require to prevent child_process to be required when loading with AMD
    this.worker = __webpack_require__(8).fork(
      this.script,
      forkOptions.forkArgs,
      forkOptions.forkOpts
    );
  }

  var me = this;

  // The ready message is only sent if the worker.add method is called (And the default script is not used)
  if (!script) {
    this.worker.ready = true;
  }

  // queue for requests that are received before the worker is ready
  this.requestQueue = [];
  this.worker.on('message', function (response) {
    if (typeof response === 'string' && response === 'ready') {
      me.worker.ready = true;
      dispatchQueuedRequests();
    } else {
      // find the task from the processing queue, and run the tasks callback
      var id = response.id;
      var task = me.processing[id];
      if (task) {
        // remove the task from the queue
        delete me.processing[id];

        // test if we need to terminate
        if (me.terminating) {
          // complete worker termination if all tasks are finished
          me.terminate();
        }

        // resolve the task's promise
        if (response.error) {
          task.resolver.reject(objectToError(response.error));
        }
        else {
          task.resolver.resolve(response.result);
        }
      }
    }
  });

  // reject all running tasks on worker error
  function onError(error) {
    me.terminated = true;
    if (me.terminating && me.terminationHandler) {
      me.terminationHandler(me);
    }
    me.terminating = false;

    for (var id in me.processing) {
      if (me.processing.hasOwnProperty(id)) {
        me.processing[id].resolver.reject(error);
      }
    }
    me.processing = {};
  }

  // send all queued requests to worker
  function dispatchQueuedRequests()
  {
    me.requestQueue.forEach(me.worker.send.bind(me.worker));
    me.requestQueue = [];
  }

  // listen for worker messages error and exit
  this.worker.on('error', onError);
  this.worker.on('exit', function () {
    var error = new Error('Worker terminated unexpectedly');
    onError(error);
  });

  this.processing = {}; // queue with tasks currently in progress

  this.terminating = false;
  this.terminated = false;
  this.terminationHandler = null;
  this.lastId = 0;
}

/**
 * Get a list with methods available on the worker.
 * @return {Promise.<String[], Error>} methods
 */
WorkerHandler.prototype.methods = function () {
  return this.exec('methods');
};

/**
 * Execute a method with given parameters on the worker
 * @param {String} method
 * @param {Array} [params]
 * @param {{resolve: Function, reject: Function}} [resolver]
 * @return {Promise.<*, Error>} result
 */
WorkerHandler.prototype.exec = function(method, params, resolver) {
  if (!resolver) {
    resolver = Promise.defer();
  }

  // generate a unique id for the task
  var id = ++this.lastId;

  // register a new task as being in progress
  this.processing[id] = {
    id: id,
    resolver: resolver
  };

  // build a JSON-RPC request
  var request = {
    id: id,
    method: method,
    params: params
  };

  if (this.terminated) {
    resolver.reject(new Error('Worker is terminated'));
  } else if (this.worker.ready) {
    // send the request to the worker
    this.worker.send(request);
  } else {
    this.requestQueue.push(request);
  }

  // on cancellation, force the worker to terminate
  var me = this;
  resolver.promise
      .catch(function (error) {
        if (error instanceof Promise.CancellationError || error instanceof Promise.TimeoutError) {
          // remove this task from the queue. It is already rejected (hence this
          // catch event), and else it will be rejected again when terminating
          delete me.processing[id];

          // terminate worker
          me.terminate(true);
        }
      });

  return resolver.promise;
};

/**
 * Test whether the worker is working or not
 * @return {boolean} Returns true if the worker is busy
 */
WorkerHandler.prototype.busy = function () {
  return Object.keys(this.processing).length > 0;
};

/**
 * Terminate the worker.
 * @param {boolean} [force=false]   If false (default), the worker is terminated
 *                                  after finishing all tasks currently in
 *                                  progress. If true, the worker will be
 *                                  terminated immediately.
 * @param {function} [callback=null] If provided, will be called when process terminates.
 */
WorkerHandler.prototype.terminate = function (force, callback) {
  if (force) {
    // cancel all tasks in progress
    for (var id in this.processing) {
      if (this.processing.hasOwnProperty(id)) {
        this.processing[id].resolver.reject(new Error('Worker terminated'));
      }
    }
    this.processing = {};
  }

  if (typeof callback === 'function') {
    this.terminationHandler = callback;
  }
  if (!this.busy()) {
    // all tasks are finished. kill the worker
    if (this.worker) {
      if (typeof this.worker.kill === 'function') {
        this.worker.kill();  // child process
      }
      else if (typeof this.worker.terminate === 'function') {
        this.worker.terminate(); // web worker
      }
      else {
        throw new Error('Failed to terminate worker');
      }
      this.worker = null;
    }
    this.terminating = false;
    this.terminated = true;
    if (this.terminationHandler) {
      this.terminationHandler(this);
    }
  }
  else {
    // we can't terminate immediately, there are still tasks being executed
    this.terminating = true;
  }
};

/**
 * Terminate the worker, returning a Promise that resolves when the termination has been done.
 * @param {boolean} [force=false]   If false (default), the worker is terminated
 *                                  after finishing all tasks currently in
 *                                  progress. If true, the worker will be
 *                                  terminated immediately.
 * @param {number} [timeout]        If provided and non-zero, worker termination promise will be rejected
 *                                  after timeout if worker process has not been terminated.
 * @return {Promise.<WorkerHandler, Error>}
 */
WorkerHandler.prototype.terminateAndNotify = function (force, timeout) {
  var resolver = Promise.defer();
  if (timeout) {
    resolver.promise.timeout = timeout;
  }
  this.terminate(force, function(worker) {
    resolver.resolve(worker);
  });
  return resolver.promise;
};

module.exports = WorkerHandler;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

/**
 * embeddedWorker.js contains an embedded version of worker.js.
 * This file is automatically generated,
 * changes made in this file will be overwritten.
 */
module.exports = "!function(r){function e(n){if(o[n])return o[n].exports;var t=o[n]={exports:{},id:n,loaded:!1};return r[n].call(t.exports,t,t.exports,e),t.loaded=!0,t.exports}var o={};e.m=r,e.c=o,e.p=\"\",e(0)}([function(module,exports,__webpack_require__){function convertError(r){return Object.getOwnPropertyNames(r).reduce(function(e,o){return Object.defineProperty(e,o,{value:r[o],enumerable:!0})},{})}function isPromise(r){return r&&\"function\"==typeof r.then&&\"function\"==typeof r.catch}var worker={};if(\"undefined\"!=typeof self&&\"function\"==typeof postMessage&&\"function\"==typeof addEventListener)worker.on=function(r,e){addEventListener(r,function(r){e(r.data)})},worker.send=function(r){postMessage(r)};else{if(\"undefined\"==typeof process)throw new Error(\"Script must be executed as a worker\");worker.on=process.on.bind(process),worker.send=process.send.bind(process)}worker.methods={},worker.methods.run=function run(fn,args){var f=eval(\"(\"+fn+\")\");return f.apply(f,args)},worker.methods.methods=function(){return Object.keys(worker.methods)},worker.on(\"message\",function(r){try{var e=worker.methods[r.method];if(!e)throw new Error('Unknown method \"'+r.method+'\"');var o=e.apply(e,r.params);isPromise(o)?o.then(function(e){worker.send({id:r.id,result:e,error:null})}).catch(function(e){worker.send({id:r.id,result:null,error:convertError(e)})}):worker.send({id:r.id,result:o,error:null})}catch(e){worker.send({id:r.id,result:null,error:convertError(e)})}}),worker.register=function(r){if(r)for(var e in r)r.hasOwnProperty(e)&&(worker.methods[e]=r[e]);worker.send(\"ready\")},exports.add=worker.register}]);";


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ })
/******/ ]);
});