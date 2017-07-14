"use strict";
var cKEYBOARD = (function () {
    function cKEYBOARD() {
        this.ee = new EventEmitter();
        this.shiftKey = false;
        this.ctrlKey = false;
        this.altKey = false;
        this.IDs = {
            'h': 72, 'i': 73, 'shift': 16, 'f4': 115, 'f5': 116, 'f6': 117, 'f7': 118, 'f8': 119
        };
    }
    Object.defineProperty(cKEYBOARD, "Instance", {
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    cKEYBOARD.prototype.initialize = function () {
        var me = this;
        window.addEventListener('keydown', function (e) {
            var id = e.which;
            console.log('Keyboard Down ID: ' + id);
            if (id === me.IDs['shift']) {
                me.shiftKey = true;
            }
            me.ee.emit('KD:' + id);
        });
        window.addEventListener('keyup', function (e) {
            var id = e.which;
            console.log('Keyboard Up ID: ' + id);
            if (id === me.IDs['shift']) {
                me.shiftKey = false;
            }
            me.ee.emit('KU:' + id);
        });
    };
    return cKEYBOARD;
}());
var KEYBOARD = cKEYBOARD.Instance;
