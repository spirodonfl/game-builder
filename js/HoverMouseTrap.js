"use strict";
var cHOVERMOUSETRAP = (function () {
    function cHOVERMOUSETRAP() {
        this.ee = new EventEmitter();
        this.stickyGrid = false;
        this.drawMove = false;
        this.clickDown = false;
    }
    Object.defineProperty(cHOVERMOUSETRAP, "Instance", {
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    cHOVERMOUSETRAP.prototype.initialize = function () {
        var elementMouseTrap = SF.gei('mouse_trap');
        if (elementMouseTrap instanceof HTMLDivElement) {
            this.divMouseTrap = elementMouseTrap;
            this.divMouseTrap.addEventListener('mousemove', this.handleMouseMove.bind(this));
            this.divMouseTrap.addEventListener('mousedown', this.handleMouseDown.bind(this));
            this.divMouseTrap.addEventListener('mouseup', this.handleMouseUp.bind(this));
        }
        var elementCanvasHover = SF.gei('canvas_hover');
        if (elementCanvasHover instanceof HTMLCanvasElement) {
            this.canvasHover = elementCanvasHover;
            this.contextHover = this.canvasHover.getContext('2d');
        }
    };
    cHOVERMOUSETRAP.prototype.calculateCoordinates = function (coordX, coordY) {
        var x = 0;
        var y = 0;
        if (this.stickyGrid) {
            x = Math.floor((coordX + SF.doc.body.scrollLeft) / 32) * 32;
            y = Math.floor((coordY + SF.doc.body.scrollTop) / 32) * 32;
        }
        else {
            x = (coordX - 16) + SF.doc.body.scrollLeft;
            y = (coordY - 16) + SF.doc.body.scrollTop;
        }
        return [x, y];
    };
    cHOVERMOUSETRAP.prototype.handleMouseMove = function (e) {
        var coordinates = this.calculateCoordinates(e.clientX, e.clientY);
        if (this.drawMove && this.contextHover) {
            this.contextHover.clearRect(0, 0, this.canvasHover.width, this.canvasHover.height);
            this.contextHover.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this.contextHover.fillRect(coordinates[0], coordinates[1], 32, 32);
        }
        this.ee.emit('Mouse Move', coordinates[0], coordinates[1]);
    };
    cHOVERMOUSETRAP.prototype.handleMouseDown = function (e) {
        this.clickDown = true;
        var coordinates = this.calculateCoordinates(e.clientX, e.clientY);
        this.ee.emit('Mouse Down', coordinates[0], coordinates[1]);
    };
    cHOVERMOUSETRAP.prototype.handleMouseUp = function (e) {
        this.clickDown = false;
        var coordinates = this.calculateCoordinates(e.clientX, e.clientY);
        this.ee.emit('Mouse Up', coordinates[0], coordinates[1]);
    };
    return cHOVERMOUSETRAP;
}());
var HOVERMOUSETRAP = cHOVERMOUSETRAP.Instance;
