"use strict";
var cTILEBUILDER = (function () {
    function cTILEBUILDER() {
    }
    Object.defineProperty(cTILEBUILDER, "Instance", {
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    cTILEBUILDER.prototype.initialize = function () {
        var me = this;
        this.dbTiles = JSON.parse(require('fs').readFileSync('assets/tiles.json', { encoding: 'utf8' })); // TODO: Error out if this does not exist or create a blank one
        var mwel = SF.gei('tile');
        if (mwel instanceof HTMLElement) {
            me.mainWindow = mwel;
            me.mainWindowHidden = false;
            KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f6'], function () {
                if (me.mainWindowHidden) {
                    me.mainWindow.style.display = 'block';
                    me.mainWindowHidden = false;
                }
                else {
                    me.mainWindow.style.display = 'none';
                    me.mainWindowHidden = true;
                }
            });
            KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f7'], function () {
                if (HOVERMOUSETRAP.stickyGrid) {
                    HOVERMOUSETRAP.stickyGrid = false;
                }
                else {
                    HOVERMOUSETRAP.stickyGrid = true;
                }
            });
            HOVERMOUSETRAP.drawMove = true;
            HOVERMOUSETRAP.initialize();
            var ct = SF.gei('canvas_tileset');
            if (ct instanceof HTMLElement) {
                me.canvasTileset = ct;
                var ctx = me.canvasTileset.getContext('2d');
                if (ctx instanceof CanvasRenderingContext2D) {
                    me.contextTileset = ctx;
                }
            }
            ct = SF.gei('canvas_tmp');
            if (ct instanceof HTMLElement) {
                me.canvasTmp = ct;
                var ctx = me.canvasTmp.getContext('2d');
                if (ctx instanceof CanvasRenderingContext2D) {
                    me.contextTmp = ctx;
                }
            }
            me.setupCanvas();
        }
    };
    cTILEBUILDER.prototype.setupCanvas = function () {
        var me = this;
        var tilesetImg = new Image();
        tilesetImg.addEventListener('load', function () {
            me.canvasTileset.width = tilesetImg.width;
            me.canvasTileset.height = tilesetImg.height;
            HOVERMOUSETRAP.canvasHover.width = tilesetImg.width;
            HOVERMOUSETRAP.canvasHover.height = tilesetImg.height;
            HOVERMOUSETRAP.divMouseTrap.style.width = tilesetImg.width + 'px';
            HOVERMOUSETRAP.divMouseTrap.style.height = tilesetImg.height + 'px';
            if (me.contextTileset !== null) {
                me.contextTileset.drawImage(tilesetImg, 0, 0);
            }
            me.setupListeners();
        });
        tilesetImg.src = 'tileset.png';
    };
    cTILEBUILDER.prototype.setupListeners = function () {
        var me = this;
        var saveButton = SF.gei('save');
        if (saveButton instanceof HTMLElement) {
            var nameOfTile = SF.gei('name_of_tile');
            if (nameOfTile instanceof HTMLElement) {
                me.nameOfTile = nameOfTile;
                var selectedImage = SF.gei('selected_image');
                if (selectedImage instanceof HTMLElement) {
                    me.selectedImage = selectedImage;
                    saveButton.addEventListener('click', function () {
                        if (me.nameOfTile.value === '') {
                            alert('Please enter a name for this tile'); // TODO: Proper alert
                        }
                        else {
                            var srcData = me.selectedImage.src.replace(/^data:image\/(png|jpg);base64,/, "");
                            var name_1 = me.nameOfTile.value;
                            name_1 = name_1.replace(/\s+/g, '-').toLowerCase();
                            require('fs').writeFileSync('assets/tiles/' + name_1 + '.png', srcData, 'base64');
                            if (!me.dbTiles[name_1]) {
                                me.dbTiles[name_1] = "";
                                require('fs').writeFileSync('assets/tiles.json', JSON.stringify(me.dbTiles), { encoding: 'utf8' });
                            }
                            alert('saved'); // TODO: A proper alert
                        }
                    });
                    HOVERMOUSETRAP.ee.on('Mouse Up', function (x, y) {
                        if (me.contextTileset !== null && me.contextTmp !== null) {
                            var img = me.contextTileset.getImageData(x, y, 32, 32);
                            me.contextTmp.putImageData(img, 0, 0);
                            me.selectedImage.src = me.canvasTmp.toDataURL();
                        }
                    });
                }
            }
        }
    };
    return cTILEBUILDER;
}());
var TILEBUILDER = cTILEBUILDER.Instance;
TILEBUILDER.initialize();
