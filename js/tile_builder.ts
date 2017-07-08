interface ITileBuilder {
    // Reference to the window that you can hide or show and where the form is to save the tile
    mainWindow: HTMLElement;
    // Instead of checking the "display" style attribute, we just keep a boolean to see if the window is showing or not
    mainWindowHidden: boolean;
    // The canvas that houses the tileset image
    canvasTileset: HTMLCanvasElement;
    // The context for the tileset canvas
    contextTileset: CanvasRenderingContext2D;
    // The canvas that houses the 32x32 selection that you make when you click somewhere on the big tileset canvas
    canvasTmp: HTMLCanvasElement;
    // The context for the canvas that houses the selected tile
    contextTmp: CanvasRenderingContext2D;
    // The input element that contains the name of the tile
    nameOfTile: HTMLInputElement;
    // The actual image element that is in the window to show you what you've selected as you save
    selectedImage: HTMLImageElement;

    initialize(): void;
    // Loads the tileset image and then updates the width / height of appropriate elements to match the image
    setupCanvas(): void;
    // Listens to thinks like the hover mouse trap, save button, etc...
    setupListeners(): void;
}

class cTILEBUILDER implements ITileBuilder {
    private static _instance: cTILEBUILDER;
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    mainWindow: HTMLElement;
    mainWindowHidden: boolean;
    canvasTileset: HTMLCanvasElement;
    contextTileset: CanvasRenderingContext2D;
    canvasTmp: HTMLCanvasElement;
    contextTmp: CanvasRenderingContext2D;
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
                let ctx = me.canvasTileset.getContext('2d');
                if (ctx instanceof CanvasRenderingContext2D) {
                    me.contextTileset = ctx;
                }
            }
            ct = SF.gei('canvas_tmp');
            if (ct instanceof HTMLElement) {
                me.canvasTmp = <HTMLCanvasElement>ct;
                let ctx = me.canvasTmp.getContext('2d');
                if (ctx instanceof CanvasRenderingContext2D) {
                    me.contextTmp = ctx;
                }
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
                        if (me.nameOfTile.value === '') {
                            alert('Please enter a name for this tile'); // TODO: Proper alert
                        } else {
                            let srcData = me.selectedImage.src.replace(/^data:image\/(png|jpg);base64,/, "");
                            require('fs').writeFileSync(me.nameOfTile.value + '.png', srcData, 'base64'); // TODO: Put this in a proper directory
                            alert('saved'); // TODO: A proper alert
                        }
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
