"use strict";
var cSF = (function () {
    function cSF() {
        this.doc = window.document || document;
    }
    Object.defineProperty(cSF, "Instance", {
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    cSF.prototype.gei = function (id) {
        var element = this.doc.getElementById(id);
        if (element instanceof HTMLElement) {
            return element;
        }
        return false;
    };
    cSF.prototype.qs = function (querySelector) {
        var element = this.doc.querySelector(querySelector);
        if (element instanceof HTMLElement) {
            return element;
        }
        return false;
    };
    cSF.prototype.qsa = function (querySelector) {
        var elements = this.doc.querySelectorAll(querySelector);
        if (elements) {
            return elements;
        }
        return false;
    };
    cSF.prototype.ce = function (type) {
        var element = this.doc.createElement(type);
        if (element instanceof HTMLElement) {
            return element;
        }
        return false;
    };
    return cSF;
}());
var SF = cSF.Instance;
