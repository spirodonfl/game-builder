/**
 * Clear instead of place: Make a key binding and show a red hover mousetrap instead of the regular
 * Layers
 * == Add a layer (make a key binding) +(?)
 * == Remove current layer -(?)
 * == Mute all layers except active layers (opacity does work!)
 * == Switch layers (shift + and - ?)
 * == You probably still want a layer window though
 */

interface IHashOfHtmlElements {
    [key: string]: HTMLElement;
}
interface IHashOfHtmlDivElements {
    [key: string]: HTMLDivElement;
}
interface IHashOfHtmlInputElements {
    [key: string]: HTMLInputElement;
}
interface IHashOfHtmlButtonElements {
    [key: string]: HTMLButtonElement;
}
interface IHashOfMapLayerCanvases {
    [key: string]: HTMLCanvasElement;
}
interface IHashOfMapLayerContexts {
    [key: string]: CanvasRenderingContext2D;
}
interface IHashOfMapDetails {
    name: string;
    width: number;
    height: number;
    layers: number;
}
interface IMapBuilder {
    ee: EventEmitter;
    windows: IHashOfHtmlDivElements;
    divs: IHashOfHtmlDivElements;
    buttons: IHashOfHtmlButtonElements;
    inputs: IHashOfHtmlInputElements;
    // Represents the loaded map details
    mapDetails: IHashOfMapDetails;
    mapLayerCanvases: IHashOfMapLayerCanvases;
    mapLayerContexts: IHashOfMapLayerContexts;
    activeLayer: number;
    // Indicates whether clicking should actually clear the selected area instead of a place a tile there
    clearClick: boolean;

    // Grabs all the windows, buttons, etc..., adds event listeners
    initialize(): void;
    hideAllWindows(): void;
    createNewMap(): void;
    loadMap(): void;
    addNewLayer(): void;
    deleteLayer(): void;
    switchToPreviousLayer(): void;
    switchToNextLayer(): void;
}

class cMAPBUILDER implements IMapBuilder {
    private static _instance: cMAPBUILDER;
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    ee: EventEmitter;
    windows: IHashOfHtmlDivElements;
    divs: IHashOfHtmlDivElements;
    buttons: IHashOfHtmlButtonElements;
    inputs: IHashOfHtmlInputElements;
    mapDetails: IHashOfMapDetails;
    activeLayer: number;
    mapLayerCanvases: IHashOfMapLayerCanvases;
    mapLayerContexts: IHashOfMapLayerContexts;
    clearClick: boolean;

    // Not in the interface because implementation details might be different
    windowIDs: Array<string>;
    buttonIDs: Array<string>;
    inputIDs: Array<string>;
    divIDs: Array<string>;

    initialize() {
        this.ee = new EventEmitter();
        this.windows = {};
        this.divs = {};
        this.buttons = {};
        this.inputs = {};
        this.mapDetails = {
            name: '',
            width: 0,
            height: 0,
            layers: 0
        }
        this.activeLayer = 0;
        this.mapLayerCanvases = {};
        this.mapLayerContexts = {};

        this.windowIDs = ['choose', 'new_map_form', 'load_map_form', 'builder'];
        for (let w = 0; w < this.windowIDs.length; ++w) {
            let id = this.windowIDs[w];
            let elementWindow = SF.gei(id);
            if (elementWindow instanceof HTMLElement) {
                this.windows[id] = <HTMLDivElement>elementWindow;
            }
        }

        this.buttonIDs = ['choose_new_map', 'choose_load_map', 'create_map', 'new_layer', 'action_save', 'action_start_over'];
        for (let b = 0; b < this.buttonIDs.length; ++b) {
            let id = this.buttonIDs[b];
            let elementButton = SF.gei(id);
            if (elementButton instanceof HTMLElement) {
                this.buttons[id] = <HTMLButtonElement>elementButton;
            }
        }

        this.inputIDs = ['new_map_name', 'new_map_grid_x', 'new_map_grid_y', 'choose_tile'];
        for (let i = 0; i < this.inputIDs.length; ++i) {
            let id = this.inputIDs[i];
            let elementInput = SF.gei(id);
            if (elementInput instanceof HTMLElement) {
                this.inputs[id] = <HTMLInputElement>elementInput;
            }
        }

        this.divIDs = ['list_layers', 'canvas_layers'];
        for (let i = 0; i < this.divIDs.length; ++i) {
            let id = this.divIDs[i];
            let elementDiv = SF.gei(id);
            if (elementDiv instanceof HTMLElement) {
                this.divs[id] = <HTMLDivElement>elementDiv;
            }
        }

        this.buttons['choose_new_map'].addEventListener('click', this.choseNewMap.bind(this));
        // this.buttons['choose_load_map'].addEventListener('click', this.loadMap.bind(this)); // TODO: this
        this.buttons['create_map'].addEventListener('click', this.createNewMap.bind(this));

        KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f7'], function () {
            if (HOVERMOUSETRAP.stickyGrid) {
                HOVERMOUSETRAP.stickyGrid = false;
            } else {
                HOVERMOUSETRAP.stickyGrid = true;
            }
        });
        KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f8'], this.toggleClearClick.bind(this));
        HOVERMOUSETRAP.drawMove = true;
        HOVERMOUSETRAP.initialize();

        this.start();
    }
    toggleClearClick() {
        if (this.clearClick) {
            this.clearClick = false;
        } else {
            this.clearClick = true;
        }
    }
    choseNewMap() {
        this.hideAllWindows();
        this.windows['new_map_form'].style.display = 'block';
    }
    createNewMap() {
        if (this.inputs['new_map_name'].value === '') {
            alert('Please enter a name for the new map'); // TODO: Proper alert
        } else if (this.inputs['new_map_grid_x'].value === '') {
            alert('Please enter a width (grid) size for the new map'); // TODO: Proper alert
        } else if (this.inputs['new_map_grid_y'].value === '') {
            alert('Please enter a height (grid) size for the new map'); // TODO: Proper alert
        } else {
            this.mapDetails.width = parseInt(this.inputs['new_map_grid_x'].value);
            this.mapDetails.height = parseInt(this.inputs['new_map_grid_y'].value);
            this.mapDetails.name = this.inputs['new_map_name'].value;
            this.hideAllWindows();
            this.initializeBuilder(true);
        }
    }
    initializeBuilder(newMap: boolean) {
        if (newMap) {
            // Create the first layer and inject into DOM
            this.addNewLayer();
        } else {
            // Load layers and inject into DOM one by one (or async?)
        }
        // Resize mousetrap && existing layers to map details
        HOVERMOUSETRAP.canvasHover.width = this.mapDetails.width * 32;
        HOVERMOUSETRAP.canvasHover.height = this.mapDetails.height * 32;
        HOVERMOUSETRAP.divMouseTrap.style.width = (this.mapDetails.width * 32) + 'px';
        HOVERMOUSETRAP.divMouseTrap.style.height = (this.mapDetails.height * 32) + 'px';

        this.buttons['new_layer'].addEventListener('click', this.addNewLayer.bind(this));
        let me = this;
        this.inputs['choose_tile'].addEventListener('change', function (e) {
            // TODO: THIS
            console.log(e);
            if (e.target instanceof HTMLInputElement) {
                if (e.target.files && e.target.files.length > 0) {
                    if (e.target.files[0] && e.target.files[0].path) {
                        let a = e.target.files[0].path;console.log(a);
                    }
                }
            }
        });

        // Listen to buttons and inputs
        this.windows['builder'].style.display = 'block';
    }
    hideAllWindows() {
        for (let w = 0; w < this.windowIDs.length; ++w) {
            let id = this.windowIDs[w];
            if (this.windows[id]) {
                this.windows[id].style.display = 'none';
            }
        }
    }
    start() {
        this.windows['new_map_form'].style.display = 'none';
        this.windows['load_map_form'].style.display = 'none';
        this.windows['builder'].style.display = 'none';
    }
    loadMap() {
        // TODO: this
    }
    addNewLayer() {
        let layerID = this.mapDetails.layers;
        let listLayer = SF.ce('li');
        if (listLayer) {
            listLayer.innerHTML = 'Layer ' + layerID;
            let delBtn = SF.ce('button');
            if (delBtn) {
                delBtn.className = 'button delete-layer';
                delBtn.setAttribute('data-layer', layerID.toString());
                delBtn.innerHTML = 'x';
                listLayer.appendChild(delBtn);
                // delBtn.addEventListener('click', function (e) {}); // TODO: this
            }
            let actBtn = SF.ce('button');
            if (actBtn) {
                actBtn.className = 'button active-layer';
                actBtn.setAttribute('data-layer', layerID.toString());
                actBtn.innerHTML = 'O';
                listLayer.appendChild(actBtn);
                // actBtn.addEventListener('click', function (e) {}); // TODO: this
            }
            let canvasLayer = SF.ce('canvas');
            if (canvasLayer) {
                let cl = <HTMLCanvasElement>canvasLayer;
                cl.className = 'canvas-layer';
                cl.width = this.mapDetails.width * 32;
                cl.height = this.mapDetails.height * 32;
                cl.style.zIndex = layerID.toString();
                cl.setAttribute('data-layer', layerID.toString());
                this.divs['canvas_layers'].appendChild(cl);
                this.mapLayerCanvases[layerID.toString()] = cl;
                let ctx = cl.getContext('2d');
                if (ctx) {
                    this.mapLayerContexts[layerID.toString()] = ctx;
                }
            }
            this.divs['list_layers'].appendChild(listLayer);
        }
        ++this.mapDetails.layers;
    }
    deleteLayer() {}
    switchToPreviousLayer() {}
    switchToNextLayer() {}
}
let MAPBUILDER = cMAPBUILDER.Instance;
MAPBUILDER.initialize();