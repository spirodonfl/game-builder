interface ITileBuilder {
    // mainWindow
    // mainWindowHidden
    // canvasTileset
    // contextTileset
    // canvasTmp
    // contextTmp
    // nameOfTile
    // selectedImage

    // initialize
    // setupCanvas
    // setupListeners
}

class cTILEBUILDER {
    private static _instance: cTILEBUILDER;
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    mainWindow: HTMLElement;
    mainWindowHidden: boolean;
    canvasTileset: HTMLCanvasElement;
    contextTileset: CanvasRenderingContext2D|null;
    canvasTmp: HTMLCanvasElement;
    contextTmp: CanvasRenderingContext2D|null;
    nameOfTile: HTMLInputElement;
    selectedImage: HTMLImageElement;

    initialize() {
        let me = this;
        let mwel = SF.gei('tile');
        if (mwel instanceof HTMLElement) {
            me.mainWindow = mwel;
            me.mainWindowHidden = false;
            KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f6'], function () {
                if (me.mainWindowHidden) {
                    me.mainWindow.style.display = 'block';
                    me.mainWindowHidden = false;
                } else {
                    me.mainWindow.style.display = 'none';
                    me.mainWindowHidden = true;
                }
            });
            KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f7'], function () {
                if (HOVERMOUSETRAP.stickyGrid) {
                    HOVERMOUSETRAP.stickyGrid = false;
                } else {
                    HOVERMOUSETRAP.stickyGrid = true;
                }
            });
            HOVERMOUSETRAP.drawMove = true;
            HOVERMOUSETRAP.initialize();

            let ct = SF.gei('canvas_tileset');
            if (ct instanceof HTMLElement) {
                me.canvasTileset = <HTMLCanvasElement>ct;
                me.contextTileset = me.canvasTileset.getContext('2d');
            }
            ct = SF.gei('canvas_tmp');
            if (ct instanceof HTMLElement) {
                me.canvasTmp = <HTMLCanvasElement>ct;
                me.contextTmp = me.canvasTmp.getContext('2d');
            }

            me.setupCanvas();
        }
    }
    setupCanvas() {
        let me = this;
        let tilesetImg = new Image();
        tilesetImg.addEventListener( 'load', function () {
            me.canvasTileset.width = tilesetImg.width;
            me.canvasTileset.height = tilesetImg.height;

            HOVERMOUSETRAP.canvasHover.width = tilesetImg.width;
            HOVERMOUSETRAP.canvasHover.height = tilesetImg.height;
            HOVERMOUSETRAP.divMouseTrap.style.width = tilesetImg.width + 'px';
            HOVERMOUSETRAP.divMouseTrap.style.height = tilesetImg.height + 'px';

            if (me.contextTileset !== null) {
                me.contextTileset.drawImage( tilesetImg, 0, 0 );
            }

            me.setupListeners();
        });
        tilesetImg.src = 'tileset.png';
    }
    setupListeners() {
        let me = this;
        let saveButton = SF.gei('save');
        if (saveButton instanceof HTMLElement) {
            let nameOfTile = SF.gei('name_of_tile');
            if (nameOfTile instanceof HTMLElement) {
                me.nameOfTile = <HTMLInputElement>nameOfTile;
                let selectedImage = SF.gei('selected_image');
                if (selectedImage instanceof HTMLElement) {
                    me.selectedImage = <HTMLImageElement>selectedImage;
                    saveButton.addEventListener('click', function () {
                        let srcData = me.selectedImage.src.replace( /^data:image\/(png|jpg);base64,/, "" );
                        require('fs').writeFileSync(me.nameOfTile.value + '.png', srcData, 'base64'); // TODO: Put this in a proper directory
                        alert('saved'); // TODO: A proper alert
                    });

                    HOVERMOUSETRAP.ee.on('Mouse Up', function(x, y) {
                        if (me.contextTileset !== null && me.contextTmp !== null) {
                            let img = me.contextTileset.getImageData(x, y, 32, 32);
                            me.contextTmp.putImageData(img, 0, 0);
                            me.selectedImage.src = me.canvasTmp.toDataURL();
                        }
                    });
                }
            }
        }
    }
}
let TILEBUILDER = cTILEBUILDER.Instance;
TILEBUILDER.initialize();
