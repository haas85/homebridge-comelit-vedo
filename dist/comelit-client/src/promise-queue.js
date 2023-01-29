'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PromiseBasedQueue = void 0;
class DeferredPromise {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
class PromiseBasedQueue {
  constructor() {
    this.queuedMessages = [];
  }
  setTimeout(timeout) {
    if (timeout && timeout > 0) {
      this.timeout = setTimeout(() => {
        this.cleanPending(timeout);
      }, timeout);
    }
  }
  cleanPending(timeout) {
    const timestamp = new Date().getTime();
    const toKeep = this.queuedMessages.reduce((keep, value) => {
      const delta = timestamp - value.timestamp;
      if (delta > timeout) {
        console.error(
          `Rejecting unresolved promise after ${delta}ms (${JSON.stringify(value.message)})`
        );
        value.promise.reject(new Error(`Timeout for message:  ${JSON.stringify(value.message)}`));
        return keep;
      }
      keep.push(value);
      return keep;
    }, []);
    this.flush();
    this.queuedMessages.push(...toKeep);
    this.timeout.refresh();
  }
  flush(shutdown) {
    if (shutdown) {
      this.queuedMessages.forEach(value => value.promise.reject(new Error('Shutting down')));
    }
    this.queuedMessages.length = 0;
  }
  processQueue(response) {
    if (this.consume(response)) {
      console.log(`Message processed. Message queue size is now ${this.queuedMessages.length}`);
    } else {
      console.error('Received message could not be processed', response);
    }
  }
  enqueue(message) {
    const timestamp = new Date().getTime();
    const promise = new DeferredPromise();
    this.queuedMessages.push({ timestamp, message, promise });
    console.log(`Message queue size is ${this.queuedMessages.length}`);
    return promise.promise;
  }
}
exports.PromiseBasedQueue = PromiseBasedQueue;
//# sourceMappingURL=promise-queue.js.map
