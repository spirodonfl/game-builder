// TODO: Layers need to be handled smarter. You can't just store an array of length. You also need the individual IDs because you might have skipped IDs if you delete layers.
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
    allLayersActive: boolean;
    selectedTileImage: HTMLImageElement;
    dbMaps: basicHash; // TODO: Add to interface?

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
            layers: 0,
            layerNames: []
        }
        this.activeLayer = 0;
        this.mapLayerCanvases = {};
        this.mapLayerContexts = {};
        this.allLayersActive = false;
        this.clearClick = false;
        this.dbMaps = JSON.parse(require('fs').readFileSync('assets/maps.json', {encoding: 'utf8'})); // TODO: Error out if this does not exist or create a blank one

        this.windowIDs = ['choose', 'new_map_form', 'load_map_form', 'builder'];
        for (let w = 0; w < this.windowIDs.length; ++w) {
            let id = this.windowIDs[w];
            let elementWindow = SF.gei(id);
            if (elementWindow instanceof HTMLElement) {
                this.windows[id] = <HTMLDivElement>elementWindow;
            }
        }

        this.buttonIDs = ['choose_new_map', 'choose_load_map', 'create_map', 'new_layer', 'action_save', 'action_start_over', 'load_map'];
        for (let b = 0; b < this.buttonIDs.length; ++b) {
            let id = this.buttonIDs[b];
            let elementButton = SF.gei(id);
            if (elementButton instanceof HTMLElement) {
                this.buttons[id] = <HTMLButtonElement>elementButton;
            }
        }

        this.inputIDs = ['new_map_name', 'new_map_grid_x', 'new_map_grid_y', 'choose_tile', 'load_map_file'];
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

        let ti = SF.gei('tile_preview_image');
        if (ti instanceof HTMLElement) {
            this.selectedTileImage = <HTMLImageElement>ti;
        }

        this.buttons['choose_new_map'].addEventListener('click', this.choseNewMap.bind(this));
        this.buttons['choose_load_map'].addEventListener('click', this.choseLoadMap.bind(this));
        this.buttons['create_map'].addEventListener('click', this.createNewMap.bind(this));
        this.buttons['load_map'].addEventListener('click', this.loadMap.bind(this));

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
    choseLoadMap() {
        this.hideAllWindows();
        this.windows['load_map_form'].style.display = 'block';
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
    saveMap() {
        let name = this.mapDetails.name;
        name = name.replace(/\s+/g, '-').toLowerCase();
        for (let ln in this.mapDetails.layerNames) {
            let layerName = this.mapDetails.layerNames[ln];
            require('fs').unlinkSync('assets/maps/' + name + '-' + layerName + '.png');
        }
        this.mapDetails.layerNames = [];
        for (let layerName in this.mapLayerCanvases) {
            let layerCanvas = this.mapLayerCanvases[layerName];
            let srcData = layerCanvas.toDataURL();
            srcData = srcData.replace(/^data:image\/(png|jpg);base64,/, "")
            require('fs').writeFileSync('assets/maps/' + name + '-' + layerName + '.png', srcData, 'base64');
            this.mapDetails.layerNames.push(layerName);
        }
        require('fs').writeFileSync('assets/maps/' + name + '.json', JSON.stringify(this.mapDetails), 'utf8');
        if (!this.dbMaps[name]) {
            this.dbMaps[name] = "";
            require('fs').writeFileSync('assets/maps.json', JSON.stringify(this.dbMaps), {encoding: 'utf8'});
        }
        alert('saved'); // TODO: Proper alert
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
            this.setActiveLayer(0);
        } else {
            for (let ln in this.mapDetails.layerNames) {
                let layerName = this.mapDetails.layerNames[ln];
                let layerID = parseInt(layerName.split('-')[1]);
                if (!this.activeLayer) {
                    this.setActiveLayer(layerID);
                    // TODO: This is not working 100%. It does not seem to initialize fully. Need to sort this one out.
                }
                this.addLoadedLayer(layerID);
            }
        }
        // Resize mousetrap && existing layers to map details
        HOVERMOUSETRAP.canvasHover.width = this.mapDetails.width * 32;
        HOVERMOUSETRAP.canvasHover.height = this.mapDetails.height * 32;
        HOVERMOUSETRAP.divMouseTrap.style.width = (this.mapDetails.width * 32) + 'px';
        HOVERMOUSETRAP.divMouseTrap.style.height = (this.mapDetails.height * 32) + 'px';

        this.buttons['new_layer'].addEventListener('click', this.addNewLayer.bind(this));
        let me = this;
        this.inputs['choose_tile'].addEventListener('change', function (e) {
            if (e.target instanceof HTMLInputElement) {
                if (e.target.files && e.target.files.length > 0) {
                    if (e.target.files[0] && e.target.files[0].path) {
                        me.selectedTileImage.src = e.target.files[0].path;
                    }
                }
            }
        });
        HOVERMOUSETRAP.ee.on('Mouse Move', function(x, y) {
            if (me.selectedTileImage.src !== '' && HOVERMOUSETRAP.clickDown) {
                me.mapLayerContexts['layer-' + me.activeLayer].clearRect(x, y, 32, 32);
                if (!me.clearClick) {
                    me.mapLayerContexts['layer-' + me.activeLayer].drawImage(me.selectedTileImage, x, y);
                }
            }
        });
        HOVERMOUSETRAP.ee.on('Mouse Up', function(x, y) {
            if (me.selectedTileImage.src !== '') {
                me.mapLayerContexts['layer-' + me.activeLayer].clearRect(x, y, 32, 32);
                if (!me.clearClick) {
                    me.mapLayerContexts['layer-' + me.activeLayer].drawImage(me.selectedTileImage, x, y);
                }
            }
        });

        this.buttons['action_save'].addEventListener('click', this.saveMap.bind(this));
        this.buttons['action_start_over'].addEventListener('click', this.startOver.bind(this));

        // Listen to buttons and inputs
        this.windows['builder'].style.display = 'block';
    }
    startOver() {
        window.location.reload();
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
        let files = this.inputs['load_map_file'].files;
        if (files instanceof FileList && files[0] instanceof File) {
            let path = files[0].path;
            this.mapDetails = JSON.parse(require('fs').readFileSync(path, {encoding: 'utf8'}));
            this.initializeBuilder(false);
        }
    }
    addLoadedLayer(layerID: number) {
        let me = this;
        let img = new Image();
        img.onload = function () {
            let listLayer = SF.ce('li');
            if (listLayer) {
                listLayer.setAttribute('data-layer', '' + layerID);
                listLayer.innerHTML = 'Layer ' + layerID;
                let delBtn = SF.ce('button');
                if (delBtn) {
                    delBtn.className = 'button delete-layer';
                    delBtn.setAttribute('data-layer', layerID.toString());
                    delBtn.innerHTML = 'x';
                    listLayer.appendChild(delBtn);
                    delBtn.addEventListener('click', me.deleteLayerButtonClicked.bind(me));
                }
                let actBtn = SF.ce('button');
                if (actBtn) {
                    actBtn.className = 'button active-layer';
                    actBtn.setAttribute('data-layer', layerID.toString());
                    actBtn.innerHTML = 'O';
                    listLayer.appendChild(actBtn);
                    actBtn.addEventListener('click', me.activeLayerButtonClicked.bind(me));
                }
                let canvasLayer = SF.ce('canvas');
                if (canvasLayer) {
                    let cl = <HTMLCanvasElement>canvasLayer;
                    cl.className = 'canvas-layer';
                    cl.width = me.mapDetails.width * 32;
                    cl.height = me.mapDetails.height * 32;
                    cl.style.zIndex = layerID.toString();
                    cl.setAttribute('data-layer', layerID.toString());
                    me.divs['canvas_layers'].appendChild(cl);
                    me.mapLayerCanvases['layer-' + layerID.toString()] = cl;
                    let ctx = cl.getContext('2d');
                    if (ctx) {
                        me.mapLayerContexts['layer-' + layerID.toString()] = ctx;
                        ctx.drawImage(img, 0, 0);
                    }
                }
                me.divs['list_layers'].appendChild(listLayer);
            }
        }
        img.onerror = function () {
            alert('Layer image did not load'); // TODO: proper alert
        }
        img.src = 'assets/maps/' + this.mapDetails.name + '-layer-' + layerID + '.png';
    }
    addNewLayer() {
        let layerID = this.mapDetails.layers;
        let listLayer = SF.ce('li');
        if (listLayer) {
            listLayer.setAttribute('data-layer', '' + layerID);
            listLayer.innerHTML = 'Layer ' + layerID;
            let delBtn = SF.ce('button');
            if (delBtn) {
                delBtn.className = 'button delete-layer';
                delBtn.setAttribute('data-layer', layerID.toString());
                delBtn.innerHTML = 'x';
                listLayer.appendChild(delBtn);
                delBtn.addEventListener('click', this.deleteLayerButtonClicked.bind(this));
            }
            let actBtn = SF.ce('button');
            if (actBtn) {
                actBtn.className = 'button active-layer';
                actBtn.setAttribute('data-layer', layerID.toString());
                actBtn.innerHTML = 'O';
                listLayer.appendChild(actBtn);
                actBtn.addEventListener('click', this.activeLayerButtonClicked.bind(this));
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
                this.mapLayerCanvases['layer-' + layerID.toString()] = cl;
                let ctx = cl.getContext('2d');
                if (ctx) {
                    this.mapLayerContexts['layer-' + layerID.toString()] = ctx;
                }
            }
            this.divs['list_layers'].appendChild(listLayer);
        }
        ++this.mapDetails.layers;
    }
    deleteLayerButtonClicked(e: Event) {
        if (e.target && e.target instanceof HTMLElement) {
            let layerID = e.target.getAttribute('data-layer');
            if (layerID) {
                let numericalID = parseInt(layerID);
                this.deleteLayer(numericalID);
            }
        }
    }
    activeLayerButtonClicked(e: Event) {
        if (e.target && e.target instanceof HTMLElement) {
            let layerID = e.target.getAttribute('data-layer');
            if (layerID) {
                let numericalID = parseInt(layerID);
                this.setActiveLayer(numericalID);
            }
        }
    }
    deleteLayer(layerID: number) {
        // TODO: Re-structure the layer IDs so you're not just incrementing all the time?
        // TODO: Make this a keyboard shortcut too?
        if (layerID === this.activeLayer && layerID > 0) {
            this.switchToPreviousLayer();
        } else {
            this.switchToNextLayer();
        }
        this.mapLayerCanvases['layer-' + layerID].remove();
        delete(this.mapLayerCanvases['layer-' + layerID]);
        delete(this.mapLayerContexts['layer-' + layerID]);

        let toDelete = SF.qsa('[data-layer="' + layerID + '"]');
        if (toDelete) {
            for (let del in toDelete) {
                if (toDelete[del] instanceof HTMLElement) {
                    toDelete[del].remove();
                    // TODO: Remove the event listeners?
                }
            }
        }
        --this.mapDetails.layers;
    }
    switchToPreviousLayer() {
        // TODO: Make this a keyboard shortcut too?
        let activeLayerElement = SF.gei('active_layer');
        if (activeLayerElement instanceof HTMLElement) {
            activeLayerElement.id = '';
        }
        activeLayerElement = SF.gei('c_active_layer');
        if (activeLayerElement instanceof HTMLElement) {
            activeLayerElement.id = '';
        }
        activeLayerElement = SF.gei('d_active_layer');
        if (activeLayerElement instanceof HTMLElement) {
            activeLayerElement.id = '';
        }
        if (this.activeLayer > 0) {
            --this.activeLayer;
        }
        let layerElement = SF.qs('.active-layer[data-layer="' + this.activeLayer + '"]');
        if (layerElement instanceof HTMLElement) {
            layerElement.id = 'd_active_layer';
        }
        layerElement = SF.qs('canvas[data-layer="' + this.activeLayer + '"]');
        if (layerElement instanceof HTMLElement) {
            layerElement.id = 'c_active_layer';
        }
    }
    switchToNextLayer() {
        // TODO: Make this a keyboard shortcut too?
        let activeLayerElement = SF.gei('active_layer');
        if (activeLayerElement instanceof HTMLElement) {
            activeLayerElement.id = '';
        }
        activeLayerElement = SF.gei('c_active_layer');
        if (activeLayerElement instanceof HTMLElement) {
            activeLayerElement.id = '';
        }
        activeLayerElement = SF.gei('d_active_layer');
        if (activeLayerElement instanceof HTMLElement) {
            activeLayerElement.id = '';
        }
        if (this.activeLayer < this.mapDetails.layers) {
            ++this.activeLayer;
        }
        let layerElement = SF.qs('.active-layer[data-layer="' + this.activeLayer + '"]');
        if (layerElement instanceof HTMLElement) {
            layerElement.id = 'd_active_layer';
        }
        layerElement = SF.qs('canvas[data-layer="' + this.activeLayer + '"]');
        if (layerElement instanceof HTMLElement) {
            layerElement.id = 'c_active_layer';
        }
    }
    setActiveLayer(layerID: number) {
        let activeLayerElement = SF.gei('active_layer');
        if (activeLayerElement instanceof HTMLElement) {
            activeLayerElement.id = '';
        }
        activeLayerElement = SF.gei('c_active_layer');
        if (activeLayerElement instanceof HTMLElement) {
            activeLayerElement.id = '';
        }
        activeLayerElement = SF.gei('d_active_layer');
        if (activeLayerElement instanceof HTMLElement) {
            activeLayerElement.id = '';
        }
        this.activeLayer = layerID;
        let layerElement = SF.qs('.active-layer[data-layer="' + this.activeLayer + '"]');
        if (layerElement instanceof HTMLElement) {
            layerElement.id = 'd_active_layer';
        }
        layerElement = SF.qs('canvas[data-layer="' + this.activeLayer + '"]');
        if (layerElement instanceof HTMLElement) {
            layerElement.id = 'c_active_layer';
        }
    }
}
let MAPBUILDER = cMAPBUILDER.Instance;
MAPBUILDER.initialize();