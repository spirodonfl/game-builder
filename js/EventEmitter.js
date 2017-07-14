"use strict";
var EventEmitter = (function () {
    function EventEmitter() {
        this._events = {};
        this._queue = [];
    }
    EventEmitter.prototype.registerEvent = function (name) {
        if (this._events[name] === undefined) {
            this._events[name] = {
                once: [],
                on: []
            };
        }
    };
    EventEmitter.prototype.on = function (eventName, subscriber) {
        this.registerEvent(eventName);
        this._events[eventName].on.push(subscriber);
    };
    EventEmitter.prototype.once = function (eventName, subscriber) {
        this.registerEvent(eventName);
        this._events[eventName].once.push(subscriber);
    };
    EventEmitter.prototype.emit = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this._events[eventName] === undefined) {
            return false;
        }
        var event = this._events[eventName];
        for (var x = 0; x < event.on.length; ++x) {
            var subscriber = event.on[x];
            subscriber.call.apply(subscriber, [this].concat(args));
        }
        for (var x = 0; x < event.once.length; ++x) {
            var subscriber = event.once[x];
            subscriber.call.apply(subscriber, [this].concat(args));
            delete (event.once[x]);
        }
    };
    EventEmitter.prototype.queue = function (eventName) {
        if (this._events[eventName] === undefined) {
            return false;
        }
        this._queue.push(eventName);
    };
    EventEmitter.prototype.flush = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        for (var x = 0; x < this._queue.length; ++x) {
            var eventName = this._queue[x];
            this.emit.apply(this, [eventName].concat(args));
        }
    };
    return EventEmitter;
}());
