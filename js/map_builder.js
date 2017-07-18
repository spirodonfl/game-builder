"use strict";
// TODO: Replace alert function calls with custom alert functionality (once it's built)
// TODO: Make keyboard shortcuts for switching layers
// TODO: Make keyboard shortcut for muting inactive layers
var cMAPBUILDER = (function () {
    function cMAPBUILDER() {
    }
    Object.defineProperty(cMAPBUILDER, "Instance", {
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    cMAPBUILDER.prototype.initialize = function () {
        this.ee = new EventEmitter();
        this.windows = {};
        this.divs = {};
        this.buttons = {};
        this.inputs = {};
        this.listItems = {};
        this.mapDetails = {
            name: '',
            width: 0,
            height: 0,
            layers: 0,
            layerNames: []
        };
        this.activeLayer = 0;
        this.mapLayerCanvases = {};
        this.mapLayerContexts = {};
        this.clearClick = false;
        this.availableMaps = {};
        this.loadedLayerIndex = 0;
        this.loadingPhase = false;
        this.dbMaps = JSON.parse(require('fs').readFileSync('assets/maps.json', { encoding: 'utf8' })); // TODO: Error out if this does not exist or create a blank one
        this.windowIDs = ['choose', 'new_map_form', 'load_map_form', 'builder'];
        for (var w = 0; w < this.windowIDs.length; ++w) {
            var id = this.windowIDs[w];
            var elementWindow = SF.gei(id);
            if (elementWindow instanceof HTMLElement) {
                this.windows[id] = elementWindow;
            }
        }
        this.buttonIDs = ['choose_new_map', 'choose_load_map', 'create_map', 'new_layer', 'action_save', 'action_start_over', 'load_map', 'mute_layers'];
        for (var b = 0; b < this.buttonIDs.length; ++b) {
            var id = this.buttonIDs[b];
            var elementButton = SF.gei(id);
            if (elementButton instanceof HTMLElement) {
                this.buttons[id] = elementButton;
            }
        }
        this.inputIDs = ['new_map_name', 'new_map_grid_x', 'new_map_grid_y', 'choose_tile', 'load_map_file'];
        for (var i = 0; i < this.inputIDs.length; ++i) {
            var id = this.inputIDs[i];
            var elementInput = SF.gei(id);
            if (elementInput instanceof HTMLElement) {
                this.inputs[id] = elementInput;
            }
        }
        this.divIDs = ['list_layers', 'canvas_layers'];
        for (var i = 0; i < this.divIDs.length; ++i) {
            var id = this.divIDs[i];
            var elementDiv = SF.gei(id);
            if (elementDiv instanceof HTMLElement) {
                this.divs[id] = elementDiv;
            }
        }
        var ti = SF.gei('tile_preview_image');
        if (ti instanceof HTMLElement) {
            this.selectedTileImage = ti;
        }
        this.buttons['choose_new_map'].addEventListener('click', this.choseNewMap.bind(this));
        this.buttons['choose_load_map'].addEventListener('click', this.choseLoadMap.bind(this));
        this.buttons['create_map'].addEventListener('click', this.createNewMap.bind(this));
        this.buttons['load_map'].addEventListener('click', this.loadMap.bind(this));
        KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f7'], function () {
            if (HOVERMOUSETRAP.stickyGrid) {
                HOVERMOUSETRAP.stickyGrid = false;
            }
            else {
                HOVERMOUSETRAP.stickyGrid = true;
            }
        });
        KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f8'], this.toggleClearClick.bind(this));
        HOVERMOUSETRAP.drawMove = true;
        HOVERMOUSETRAP.initialize();
        this.start();
    };
    cMAPBUILDER.prototype.choseLoadMap = function () {
        this.hideAllWindows();
        this.windows['load_map_form'].style.display = 'block';
        this.availableMaps = JSON.parse(require('fs').readFileSync('assets/maps.json'));
        for (var m in this.availableMaps) {
            var mapName = m;
            var op = SF.ce('option');
            if (op instanceof HTMLElement) {
                var option = op;
                option.value = mapName;
                option.innerHTML = mapName;
                this.inputs['load_map_file'].appendChild(option);
            }
        }
    };
    cMAPBUILDER.prototype.toggleClearClick = function () {
        if (this.clearClick) {
            this.clearClick = false;
        }
        else {
            this.clearClick = true;
        }
    };
    cMAPBUILDER.prototype.choseNewMap = function () {
        this.hideAllWindows();
        this.windows['new_map_form'].style.display = 'block';
    };
    cMAPBUILDER.prototype.saveMap = function () {
        var name = this.mapDetails.name;
        name = name.replace(/\s+/g, '-').toLowerCase();
        for (var ln in this.mapDetails.layerNames) {
            var layerName = this.mapDetails.layerNames[ln];
            if (require('fs').existsSync('assets/maps/' + name + '-' + layerName + '.png')) {
                require('fs').unlinkSync('assets/maps/' + name + '-' + layerName + '.png');
            }
        }
        // this.mapDetails.layerNames = [];
        for (var layerName in this.mapLayerCanvases) {
            var layerCanvas = this.mapLayerCanvases[layerName];
            var srcData = layerCanvas.toDataURL();
            srcData = srcData.replace(/^data:image\/(png|jpg);base64,/, "");
            require('fs').writeFileSync('assets/maps/' + name + '-' + layerName + '.png', srcData, 'base64');
            // this.mapDetails.layerNames.push(layerName);
        }
        console.log(this.mapDetails);
        require('fs').writeFileSync('assets/maps/' + name + '.json', JSON.stringify(this.mapDetails), 'utf8');
        if (!this.dbMaps[name]) {
            this.dbMaps[name] = "";
            require('fs').writeFileSync('assets/maps.json', JSON.stringify(this.dbMaps), { encoding: 'utf8' });
        }
        alert('saved');
    };
    cMAPBUILDER.prototype.createNewMap = function () {
        if (this.inputs['new_map_name'].value === '') {
            alert('Please enter a name for the new map');
        }
        else if (this.inputs['new_map_grid_x'].value === '') {
            alert('Please enter a width (grid) size for the new map');
        }
        else if (this.inputs['new_map_grid_y'].value === '') {
            alert('Please enter a height (grid) size for the new map');
        }
        else {
            this.mapDetails.width = parseInt(this.inputs['new_map_grid_x'].value);
            this.mapDetails.height = parseInt(this.inputs['new_map_grid_y'].value);
            this.mapDetails.name = this.inputs['new_map_name'].value;
            this.hideAllWindows();
            this.initializeBuilder(true);
        }
    };
    cMAPBUILDER.prototype.initializeBuilder = function (newMap) {
        if (newMap) {
            // Create the first layer and inject into DOM
            this.addNewLayer();
            this.setActiveLayer(0);
        }
        else {
            this.loadingPhase = true;
            this.loadSingleLayer();
        }
        // Resize mousetrap && existing layers to map details
        HOVERMOUSETRAP.canvasHover.width = this.mapDetails.width * 32;
        HOVERMOUSETRAP.canvasHover.height = this.mapDetails.height * 32;
        HOVERMOUSETRAP.divMouseTrap.style.width = (this.mapDetails.width * 32) + 'px';
        HOVERMOUSETRAP.divMouseTrap.style.height = (this.mapDetails.height * 32) + 'px';
        this.buttons['new_layer'].addEventListener('click', this.addNewLayer.bind(this));
        this.buttons['mute_layers'].addEventListener('click', this.showHideLayers.bind(this));
        var me = this;
        this.inputs['choose_tile'].addEventListener('change', function (e) {
            if (e.target instanceof HTMLInputElement) {
                if (e.target.files && e.target.files.length > 0) {
                    if (e.target.files[0] && e.target.files[0].path) {
                        me.selectedTileImage.src = e.target.files[0].path;
                    }
                }
            }
        });
        HOVERMOUSETRAP.ee.on('Mouse Move', function (x, y) {
            if (me.selectedTileImage.src !== '' && HOVERMOUSETRAP.clickDown) {
                me.mapLayerContexts['layer-' + me.activeLayer].clearRect(x, y, 32, 32);
                if (!me.clearClick) {
                    me.mapLayerContexts['layer-' + me.activeLayer].drawImage(me.selectedTileImage, x, y);
                }
            }
        });
        HOVERMOUSETRAP.ee.on('Mouse Up', function (x, y) {
            if (me.selectedTileImage.src !== '') {
                me.mapLayerContexts['layer-' + me.activeLayer].clearRect(x, y, 32, 32);
                if (!me.clearClick) {
                    me.mapLayerContexts['layer-' + me.activeLayer].drawImage(me.selectedTileImage, x, y);
                }
            }
        });
        this.buttons['action_save'].addEventListener('click', this.saveMap.bind(this));
        this.buttons['action_start_over'].addEventListener('click', this.startOver.bind(this));
        this.windows['builder'].style.display = 'block';
        KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f6'], this.toggleBuilderWindow.bind(this));
    };
    cMAPBUILDER.prototype.toggleBuilderWindow = function () {
        if (this.windows['builder'].style.display === 'block') {
            this.windows['builder'].style.display = 'none';
        }
        else {
            this.windows['builder'].style.display = 'block';
        }
    };
    cMAPBUILDER.prototype.showHideLayers = function () {
        if (this.muteLayers) {
            this.muteLayers = false;
            this.buttons['mute_layers'].innerHTML = 'Mute Layers';
        }
        else {
            this.muteLayers = true;
            this.buttons['mute_layers'].innerHTML = 'Unmute Layers';
        }
        this.setActiveLayer(this.activeLayer);
    };
    cMAPBUILDER.prototype.loadSingleLayer = function () {
        if (this.loadedLayerIndex < this.mapDetails.layerNames.length) {
            var layerName = this.mapDetails.layerNames[this.loadedLayerIndex];
            var layerID = parseInt(layerName.split('-')[1]);
            ++this.loadedLayerIndex;
            this.addLoadedLayer(layerID);
        }
        else {
            this.loadingPhase = false;
        }
    };
    cMAPBUILDER.prototype.startOver = function () {
        window.location.reload();
    };
    cMAPBUILDER.prototype.hideAllWindows = function () {
        for (var w = 0; w < this.windowIDs.length; ++w) {
            var id = this.windowIDs[w];
            if (this.windows[id]) {
                this.windows[id].style.display = 'none';
            }
        }
    };
    cMAPBUILDER.prototype.start = function () {
        this.windows['new_map_form'].style.display = 'none';
        this.windows['load_map_form'].style.display = 'none';
        this.windows['builder'].style.display = 'none';
    };
    cMAPBUILDER.prototype.loadMap = function () {
        var path = 'assets/maps/' + this.inputs['load_map_file'].value + '.json';
        this.mapDetails = JSON.parse(require('fs').readFileSync(path, { encoding: 'utf8' }));
        this.initializeBuilder(false);
    };
    cMAPBUILDER.prototype.addLoadedLayer = function (layerID) {
        var me = this;
        var img = new Image();
        img.onload = function () {
            var listLayer = SF.ce('li');
            if (listLayer instanceof HTMLLIElement) {
                listLayer.setAttribute('data-layer', '' + layerID);
                listLayer.innerHTML = 'Layer ' + layerID;
                var delBtn = SF.ce('button');
                if (delBtn instanceof HTMLButtonElement) {
                    delBtn.className = 'button';
                    delBtn.setAttribute('data-layer', layerID.toString());
                    delBtn.innerHTML = 'x';
                    listLayer.appendChild(delBtn);
                    delBtn.addEventListener('click', me.deleteLayerButtonClicked.bind(me));
                    me.buttons['delete-layer-' + layerID.toString()] = delBtn;
                }
                var actBtn = SF.ce('button');
                if (actBtn instanceof HTMLButtonElement) {
                    actBtn.className = 'button';
                    actBtn.setAttribute('data-layer', layerID.toString());
                    actBtn.innerHTML = 'O';
                    listLayer.appendChild(actBtn);
                    actBtn.addEventListener('click', me.activeLayerButtonClicked.bind(me));
                    me.buttons['activate-layer-' + layerID.toString()] = actBtn;
                }
                var canvasLayer = SF.ce('canvas');
                if (canvasLayer) {
                    var cl = canvasLayer;
                    cl.className = 'canvas-layer';
                    cl.width = me.mapDetails.width * 32;
                    cl.height = me.mapDetails.height * 32;
                    cl.style.zIndex = layerID.toString();
                    cl.setAttribute('data-layer', layerID.toString());
                    me.divs['canvas_layers'].appendChild(cl);
                    me.mapLayerCanvases['layer-' + layerID.toString()] = cl;
                    var ctx = cl.getContext('2d');
                    if (ctx) {
                        me.mapLayerContexts['layer-' + layerID.toString()] = ctx;
                        ctx.drawImage(img, 0, 0);
                        me.divs['list_layers'].appendChild(listLayer);
                        me.listItems['layer-' + layerID.toString()] = listLayer;
                        if (!me.activeLayer) {
                            me.setActiveLayer(layerID);
                        }
                        me.loadSingleLayer();
                    }
                }
            }
        };
        img.onerror = function () {
            alert('Layer image did not load'); // TODO: proper alert
        };
        img.src = 'assets/maps/' + this.mapDetails.name + '-layer-' + layerID + '.png';
    };
    cMAPBUILDER.prototype.addNewLayer = function () {
        var layerID = this.mapDetails.layers;
        var listLayer = SF.ce('li');
        if (listLayer instanceof HTMLLIElement) {
            listLayer.setAttribute('data-layer', '' + layerID);
            listLayer.innerHTML = 'Layer ' + layerID;
            var delBtn = SF.ce('button');
            if (delBtn instanceof HTMLButtonElement) {
                delBtn.className = 'button';
                delBtn.setAttribute('data-layer', layerID.toString());
                delBtn.innerHTML = 'x';
                listLayer.appendChild(delBtn);
                delBtn.addEventListener('click', this.deleteLayerButtonClicked.bind(this));
                this.buttons['delete-layer-' + layerID.toString()] = delBtn;
            }
            var actBtn = SF.ce('button');
            if (actBtn instanceof HTMLButtonElement) {
                actBtn.className = 'button';
                actBtn.setAttribute('data-layer', layerID.toString());
                actBtn.innerHTML = 'O';
                listLayer.appendChild(actBtn);
                actBtn.addEventListener('click', this.activeLayerButtonClicked.bind(this));
                this.buttons['activate-layer-' + layerID.toString()] = actBtn;
            }
            var canvasLayer = SF.ce('canvas');
            if (canvasLayer) {
                var cl = canvasLayer;
                cl.className = 'canvas-layer';
                cl.width = this.mapDetails.width * 32;
                cl.height = this.mapDetails.height * 32;
                cl.style.zIndex = layerID.toString();
                cl.setAttribute('data-layer', layerID.toString());
                this.divs['canvas_layers'].appendChild(cl);
                this.mapLayerCanvases['layer-' + layerID.toString()] = cl;
                var ctx = cl.getContext('2d');
                if (ctx) {
                    this.mapLayerContexts['layer-' + layerID.toString()] = ctx;
                    this.mapDetails.layerNames.push('layer-' + layerID.toString());
                    this.divs['list_layers'].appendChild(listLayer);
                    this.listItems['layer-' + layerID.toString()] = listLayer;
                }
            }
        }
        ++this.mapDetails.layers;
    };
    cMAPBUILDER.prototype.deleteLayerButtonClicked = function (e) {
        if (e.target && e.target instanceof HTMLElement) {
            var layerID = e.target.getAttribute('data-layer');
            if (layerID) {
                var numericalID = parseInt(layerID);
                this.deleteLayer(numericalID);
            }
        }
        // TODO: Re-arrange the layers now
    };
    cMAPBUILDER.prototype.activeLayerButtonClicked = function (e) {
        if (e.target && e.target instanceof HTMLElement) {
            var layerID = e.target.getAttribute('data-layer');
            if (layerID) {
                var numericalID = parseInt(layerID);
                this.setActiveLayer(numericalID);
            }
        }
    };
    cMAPBUILDER.prototype.deleteLayer = function (layerID) {
        if (layerID === this.activeLayer && layerID > 0) {
            this.switchToPreviousLayer();
        }
        else {
            this.switchToNextLayer();
        }
        this.mapLayerCanvases['layer-' + layerID].remove();
        delete (this.mapLayerCanvases['layer-' + layerID]);
        delete (this.mapLayerContexts['layer-' + layerID]);
        this.buttons['delete-layer-' + layerID].remove();
        delete (this.buttons['delete-layer-' + layerID]);
        this.buttons['activate-layer-' + layerID].remove();
        delete (this.buttons['activate-layer-' + layerID]);
        this.listItems['layer-' + layerID].remove();
        var newLayerNames = [];
        for (var x = 0; x < this.mapDetails.layerNames.length; ++x) {
            var layerName = this.mapDetails.layerNames[x];
            if (layerName === ('layer-' + layerID.toString())) {
                delete (this.mapDetails.layerNames[x]);
            }
            else {
                newLayerNames.push(layerName);
            }
        }
        this.mapDetails.layerNames = newLayerNames;
        this.mapDetails.layers = this.mapDetails.layerNames.length;
    };
    cMAPBUILDER.prototype.switchToPreviousLayer = function () {
        if (this.activeLayer > 0) {
            --this.activeLayer;
        }
    };
    cMAPBUILDER.prototype.switchToNextLayer = function () {
        if (this.activeLayer < this.mapDetails.layers) {
            ++this.activeLayer;
        }
    };
    cMAPBUILDER.prototype.setActiveLayer = function (layerID) {
        for (var b in this.buttons) {
            if (b.indexOf('delete-layer') || b.indexOf('activate-layer')) {
                this.buttons[b].classList.remove('active-layer');
            }
            if (b === 'activate-layer-' + layerID || b === 'activate-layer-' + layerID) {
                this.buttons[b].classList.add('active-layer');
            }
        }
        for (var c in this.mapLayerCanvases) {
            this.mapLayerCanvases[c].classList.remove('non-active-layer');
            if (c !== 'layer-' + layerID && this.muteLayers) {
                this.mapLayerCanvases[c].classList.add('non-active-layer');
            }
        }
        this.activeLayer = layerID;
    };
    return cMAPBUILDER;
}());
var MAPBUILDER = cMAPBUILDER.Instance;
MAPBUILDER.initialize();
