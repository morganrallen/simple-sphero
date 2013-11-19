var EventEmitter = require("events").EventEmitter;
var util = require("util");

function train(functions) {
  EventEmitter.call(this);

  this._queue = [];
  this._queing = false;

  var self = this;

  for(var p in functions) {
    if(p[0] !== "_" && typeof functions[p] === "function") {
      this[p] = (function(func) {
        return function wrapper(arg1, arg2, arg3) {
          if(self._queing) {
            this._queue.push([wrapper, arg1, arg2, arg3]);
            return this;
          } else {
            return func.call(self, arg1, arg2, arg3);
          }
        };
      })(functions[p]);
    }
  }

  return this;
}

util.inherits(train, EventEmitter);

train.prototype._startQueing = function() {
  this._queing = true;
  return this;
},

train.prototype._stopQueing = function() {
  this._queing = false;

  var q;
  while(!this._queing && (q = this._queue.shift())) {
    q[0].call(this, q[1], q[2], q[3]);
  }

  return this;
}

module.exports = train;
