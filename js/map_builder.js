"use strict";
// TODO: Replace alert function calls with custom alert functionality (once it's built)
// TODO: Make keyboard shortcuts for switching layers (show a simple popup to indicate layer you're on)
// TODO: Make keyboard shortcut for muting inactive layers (show a simple popup to indicate action taken)
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
        this.mapDetails = {
            name: '',
            width: 0,
            height: 0,
            layers: 0,
            layerNames: []
        };
        this.activeLayer = 0;
        this.mapLayerCanvases = [];
        this.mapLayerContexts = [];
        this.clearClick = false;
        this.availableMaps = {};
        this.loadedLayerIndex = 0;
        this.loadingPhase = false;
        this.layerDeleteButtons = [];
        this.layerActivateButtons = [];
        this.layerListItems = [];
        this.layerSpans = [];
        if (require('fs').existsSync('assets/maps.json')) {
            this.dbMaps = JSON.parse(require('fs').readFileSync('assets/maps.json', { encoding: 'utf8' }));
            this.windowIDs = ['choose', 'new_map_form', 'load_map_form', 'builder'];
            for (var w = 0; w < this.windowIDs.length; ++w) {
                var id = this.windowIDs[w];
                var elementWindow = SF.gei(id);
                if (elementWindow instanceof HTMLElement) {
                    this.windows[id] = elementWindow;
                }
            }
            this.buttonIDs = ['choose_new_map', 'choose_load_map', 'create_map', 'new_layer', 'action_save', 'load_map', 'mute_layers'];
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
                HOVERMOUSETRAP.stickyGrid = !HOVERMOUSETRAP.stickyGrid;
            });
            KEYBOARD.ee.on('KU:' + KEYBOARD.IDs['f8'], this.toggleClearClick.bind(this));
            HOVERMOUSETRAP.drawMove = true;
            HOVERMOUSETRAP.initialize();
            this.start();
        }
        else {
            alert('No maps DB file found!');
        }
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
        this.clearClick = !this.clearClick;
    };
    cMAPBUILDER.prototype.choseNewMap = function () {
        this.hideAllWindows();
        this.windows['new_map_form'].style.display = 'block';
    };
    cMAPBUILDER.prototype.saveMap = function () {
        var name = this.mapDetails.name;
        name = name.replace(/\s+/g, '-').toLowerCase();
        // NOTE: There's probably a smarter way to do this but, in reality, we max out at 100 layers so this is fine for now.
        for (var x = 0; x <= 100; ++x) {
            if (require('fs').existsSync('assets/maps/' + name + '-' + x.toString() + '.png')) {
                require('fs').unlinkSync('assets/maps/' + name + '-' + x.toString() + '.png');
            }
        }
        for (var l = 0; l < this.mapDetails.layers; ++l) {
            var cnv = this.mapLayerCanvases[l];
            var srcData = cnv.toDataURL();
            srcData = srcData.replace(/^data:image\/(png|jpg);base64,/, "");
            require('fs').writeFileSync('assets/maps/' + name + '-' + l.toString() + '.png', srcData, 'base64');
        }
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
                me.mapLayerContexts[me.activeLayer].clearRect(x, y, 32, 32);
                if (!me.clearClick) {
                    me.mapLayerContexts[me.activeLayer].drawImage(me.selectedTileImage, x, y);
                }
            }
        });
        HOVERMOUSETRAP.ee.on('Mouse Up', function (x, y) {
            if (me.selectedTileImage.src !== '') {
                me.mapLayerContexts[me.activeLayer].clearRect(x, y, 32, 32);
                if (!me.clearClick) {
                    me.mapLayerContexts[me.activeLayer].drawImage(me.selectedTileImage, x, y);
                }
            }
        });
        this.buttons['action_save'].addEventListener('click', this.saveMap.bind(this));
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
        if (this.loadedLayerIndex < this.mapDetails.layers) {
            this.addLoadedLayer(this.loadedLayerIndex);
        }
        else {
            if (!this.activeLayer) {
                this.setActiveLayer(0);
            }
            this.loadingPhase = false;
        }
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
                var llSpan = SF.ce('span');
                if (llSpan instanceof HTMLSpanElement) {
                    llSpan.innerHTML = 'Layer ' + layerID;
                    listLayer.appendChild(llSpan);
                    me.layerSpans.push(llSpan);
                }
                var delBtn = SF.ce('button');
                if (delBtn instanceof HTMLButtonElement) {
                    delBtn.className = 'button';
                    delBtn.setAttribute('data-layer', layerID.toString());
                    delBtn.innerHTML = 'x';
                    listLayer.appendChild(delBtn);
                    delBtn.addEventListener('click', me.deleteLayerButtonClicked.bind(me));
                    me.layerDeleteButtons.push(delBtn);
                }
                var actBtn = SF.ce('button');
                if (actBtn instanceof HTMLButtonElement) {
                    actBtn.className = 'button';
                    actBtn.setAttribute('data-layer', layerID.toString());
                    actBtn.innerHTML = 'O';
                    listLayer.appendChild(actBtn);
                    actBtn.addEventListener('click', me.activeLayerButtonClicked.bind(me));
                    me.layerActivateButtons.push(actBtn);
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
                    me.mapLayerCanvases.push(cl);
                    var ctx = cl.getContext('2d');
                    if (ctx) {
                        me.mapLayerContexts.push(ctx);
                        ctx.drawImage(img, 0, 0);
                        me.divs['list_layers'].appendChild(listLayer);
                        me.layerListItems.push(listLayer);
                        ++me.loadedLayerIndex;
                        me.loadSingleLayer();
                    }
                }
            }
        };
        img.onerror = function () {
            alert('Layer image did not load');
        };
        img.src = 'assets/maps/' + this.mapDetails.name + '-' + layerID + '.png';
    };
    cMAPBUILDER.prototype.addNewLayer = function () {
        var layerID = this.mapDetails.layers;
        var listLayer = SF.ce('li');
        if (listLayer instanceof HTMLLIElement) {
            listLayer.setAttribute('data-layer', '' + layerID);
            var llSpan = SF.ce('span');
            if (llSpan instanceof HTMLSpanElement) {
                llSpan.innerHTML = 'Layer ' + layerID;
                listLayer.appendChild(llSpan);
                this.layerSpans.push(llSpan);
            }
            var delBtn = SF.ce('button');
            if (delBtn instanceof HTMLButtonElement) {
                delBtn.className = 'button';
                delBtn.setAttribute('data-layer', layerID.toString());
                delBtn.innerHTML = 'x';
                listLayer.appendChild(delBtn);
                delBtn.addEventListener('click', this.deleteLayerButtonClicked.bind(this));
                this.layerDeleteButtons.push(delBtn);
            }
            var actBtn = SF.ce('button');
            if (actBtn instanceof HTMLButtonElement) {
                actBtn.className = 'button';
                actBtn.setAttribute('data-layer', layerID.toString());
                actBtn.innerHTML = 'O';
                listLayer.appendChild(actBtn);
                actBtn.addEventListener('click', this.activeLayerButtonClicked.bind(this));
                this.buttons['activate-layer-' + layerID.toString()] = actBtn;
                this.layerActivateButtons.push(actBtn);
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
                this.mapLayerCanvases.push(cl);
                var ctx = cl.getContext('2d');
                if (ctx) {
                    this.mapLayerContexts.push(ctx);
                    this.divs['list_layers'].appendChild(listLayer);
                    this.layerListItems.push(listLayer);
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
                for (var l = 0; l < this.mapDetails.layers; ++l) {
                    this.mapLayerCanvases[l].style.zIndex = l.toString();
                    this.mapLayerCanvases[l].setAttribute('data-layer', l.toString());
                    this.layerSpans[l].innerHTML = 'Layer ' + l.toString();
                    this.layerDeleteButtons[l].setAttribute('data-layer', l.toString());
                    this.layerActivateButtons[l].setAttribute('data-layer', l.toString());
                }
            }
        }
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
        this.mapLayerCanvases[layerID].remove();
        this.mapLayerCanvases.splice(layerID, 1);
        this.mapLayerContexts.splice(layerID, 1);
        this.layerDeleteButtons[layerID].remove();
        this.layerDeleteButtons.splice(layerID, 1);
        this.layerActivateButtons[layerID].remove();
        this.layerActivateButtons.splice(layerID, 1);
        this.layerSpans[layerID].remove();
        this.layerSpans.splice(layerID, 1);
        this.layerListItems[layerID].remove();
        this.layerListItems.splice(layerID, 1);
        --this.mapDetails.layers;
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
        for (var b = 0; b < this.mapDetails.layers; ++b) {
            this.layerDeleteButtons[b].classList.remove('active-layer');
            this.layerActivateButtons[b].classList.remove('active-layer');
            if (b === layerID) {
                this.layerDeleteButtons[b].classList.add('active-layer');
                this.layerActivateButtons[b].classList.add('active-layer');
            }
            this.mapLayerCanvases[b].classList.remove('non-active-layer');
            if (b !== layerID && this.muteLayers) {
                this.mapLayerCanvases[b].classList.add('non-active-layer');
            }
        }
        this.activeLayer = layerID;
    };
    return cMAPBUILDER;
}());
var MAPBUILDER = cMAPBUILDER.Instance;
MAPBUILDER.initialize();
