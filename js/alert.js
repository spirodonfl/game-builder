"use strict";
var cALERT = (function () {
    function cALERT() {
    }
    Object.defineProperty(cALERT, "Instance", {
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    cALERT.prototype.initialize = function () {
        this.isShowing = false;
        this.divs = {};
        this.buttons = {};
        this.divIDs = ['alert_overlay', 'window_alert', 'window_alert_title', 'window_alert_content'];
        for (var w = 0; w < this.divIDs.length; ++w) {
            var id = this.divIDs[w];
            var elementWindow = SF.gei(id);
            if (elementWindow instanceof HTMLElement) {
                this.divs[id] = elementWindow;
            }
        }
        this.buttonIDs = ['window_alert_ok'];
        for (var b = 0; b < this.buttonIDs.length; ++b) {
            var id = this.buttonIDs[b];
            var elementButton = SF.gei(id);
            if (elementButton instanceof HTMLElement) {
                this.buttons[id] = elementButton;
            }
        }
        this.buttons['window_alert_ok'].addEventListener('click', this.okClicked.bind(this));
    };
    cALERT.prototype.okClicked = function () {
        this.hideAlert();
    };
    cALERT.prototype.showAlert = function (message, title) {
        this.divs['window_alert_content'].innerHTML = message;
        if (title) {
            this.divs['window_alert_title'].innerHTML = title;
        }
        this.divs['alert_overlay'].style.display = 'block';
        this.divs['window_alert'].style.display = 'block';
        this.isShowing = true;
    };
    cALERT.prototype.hideAlert = function () {
        this.isShowing = false;
        this.divs['alert_overlay'].style.display = 'none';
        this.divs['window_alert'].style.display = 'none';
    };
    return cALERT;
}());
var ALERT = cALERT.Instance;
ALERT.initialize();
