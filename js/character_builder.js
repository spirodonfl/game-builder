"use strict";
var cCHARACTERBUILDER = (function () {
    function cCHARACTERBUILDER() {
    }
    Object.defineProperty(cCHARACTERBUILDER, "Instance", {
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    cCHARACTERBUILDER.prototype.initialize = function () {
        this.ee = new EventEmitter();
        this.iColors = ['black', 'blue', 'green', 'red', 'white', 'yellow'];
        this.iTypes = ['acce1', 'acce2', 'body', 'hair', 'hairop', 'mante', 'option'];
        this.iSides = {
            'acce1': ['front', 'back', 'top'],
            'acce2': ['front', 'middle', 'back'],
            'hair': ['front', 'back', 'top'],
            'hairop': ['front', 'back'],
            'mante': ['front', 'back'],
            'option': ['front', 'back']
        };
        this.ym = {};
        this.yw = {};
        this.iImages = [];
        this.dbCharacters = JSON.parse(require('fs').readFileSync('assets/characters.json', { encoding: 'utf8' })); // TODO: Error out if this does not exist or create a blank one
        this.windows = {};
        this.divs = {};
        this.buttons = {};
        this.inputs = {};
        this.selects = {};
        this.canvases = {};
        this.contexts = {};
        this.images = {};
        // TODO: See if you can make a function of the loops below. Issue is with dynamic typecasting. Look it up.
        this.windowIDs = ['character'];
        for (var x = 0; x < this.windowIDs.length; ++x) {
            var id = this.windowIDs[x];
            var el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.windows[id] = el;
            }
        }
        this.inputIDs = ['character_name'];
        for (var x = 0; x < this.inputIDs.length; ++x) {
            var id = this.inputIDs[x];
            var el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.inputs[id] = el;
            }
        }
        this.selectIDs = ['gender'];
        for (var x = 0; x < this.selectIDs.length; ++x) {
            var id = this.selectIDs[x];
            var el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.selects[id] = el;
            }
        }
        this.buttonIDs = ['save_character'];
        for (var x = 0; x < this.buttonIDs.length; ++x) {
            var id = this.buttonIDs[x];
            var el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.buttons[id] = el;
            }
        }
        this.divIDs = ['cf_ym', 'cf_yw', 'cf_ym_acce1', 'cf_ym_acce2', 'cf_ym_body', 'cf_ym_hair', 'cf_ym_hairop', 'cf_ym_mante', 'cf_ym_option', 'cf_yw_acce1', 'cf_yw_acce2', 'cf_yw_body', 'cf_yw_hair', 'cf_yw_hairop', 'cf_yw_mante', 'cf_yw_option'];
        for (var x = 0; x < this.divIDs.length; ++x) {
            var id = this.divIDs[x];
            var el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.divs[id] = el;
            }
        }
        this.canvasIDs = ['canvas_character'];
        for (var x = 0; x < this.canvasIDs.length; ++x) {
            var id = this.canvasIDs[x];
            var el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.canvases[id] = el;
                var ctx = this.canvases[id].getContext('2d');
                if (ctx instanceof CanvasRenderingContext2D) {
                    this.contexts[id] = ctx;
                }
            }
        }
        this.imageIDs = ['cg_option_b', 'cg_acce1_b', 'cg_hairop_b', 'cg_hair_b', 'cg_mante_b', 'cg_acce2_b', 'cg_body', 'cg_hair_f', 'cg_acce2_m', 'cg_mante_f', 'cg_acce1_f', 'cg_hair_t', 'cg_acce2_f', 'cg_hairop_f', 'cg_acce1_t', 'cg_option_f'];
        for (var x = 0; x < this.imageIDs.length; ++x) {
            var id = this.imageIDs[x];
            var el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.images[id] = el;
            }
        }
        if (require('fs').existsSync('chargen/chargen_assets.json')) {
            var assets = require('fs').readFileSync('chargen/chargen_assets.json', { encoding: 'utf8' });
            assets = JSON.parse(assets);
            this.ym = assets.ym;
            this.yw = assets.yw;
        }
        else {
            alert('Cannot find chargen assets JSON!'); // TODO: Proper alert
            // TODO: At this point, the entire page should just top and not continue
        }
        this.preloadImages('ym', this.ym);
        this.preloadImages('yw', this.yw);
        // TODO: Can we take out the inline checkImagesLoaded function and make it its own thing? That way we can also use a "this" reference too.
        var totalImages = this.iImages.length;
        var imagesLoaded = 0;
        function checkImagesLoaded() {
            ++imagesLoaded;
            if (imagesLoaded === totalImages) {
                for (var x = 0; x < totalImages; ++x) {
                    var img = CHARACTERBUILDER.iImages[x];
                    var gender = img.getAttribute('data-gender');
                    var type = img.getAttribute('data-type');
                    var parent_1 = CHARACTERBUILDER.divs['cf_' + gender + '_' + type];
                    img.addEventListener('click', CHARACTERBUILDER.handleImageClick.bind(CHARACTERBUILDER));
                    parent_1.appendChild(img);
                }
            }
        }
        for (var x = 0; x < totalImages; ++x) {
            var img = this.iImages[x];
            img.addEventListener('load', checkImagesLoaded);
            img.src = img.getAttribute('data-src');
        }
        // TODO: Can we use a method instead of an inline function? That way we can also use "this" references.
        this.selects['gender'].addEventListener('change', function (e) {
            if (e.target && e.target instanceof HTMLSelectElement) {
                if (e.target.value === 'ym') {
                    CHARACTERBUILDER.divs['cf_ym'].style.display = 'block';
                    CHARACTERBUILDER.divs['cf_yw'].style.display = 'none';
                }
                else {
                    CHARACTERBUILDER.divs['cf_ym'].style.display = 'none';
                    CHARACTERBUILDER.divs['cf_yw'].style.display = 'block';
                }
            }
        });
        // TODO: Can we use a method instead of an inline function? That way we can also use "this" references.
        this.buttons['save_character'].addEventListener('click', function () {
            var name = CHARACTERBUILDER.inputs['character_name'].value;
            if (name === '') {
                alert('Please enter a name for this character.'); // TODO: Proper alert
            }
            else {
                name = name.replace(/\s+/g, '-').toLowerCase();
                var data = CHARACTERBUILDER.canvases['canvas_character'].toDataURL();
                data = data.replace(/^data:image\/(png|jpg);base64,/, "");
                require('fs').writeFileSync('assets/characters/' + name + '.png', data, 'base64');
                if (!CHARACTERBUILDER.dbCharacters[name]) {
                    CHARACTERBUILDER.dbCharacters[name] = "";
                    require('fs').writeFileSync('assets/characters.json', JSON.stringify(CHARACTERBUILDER.dbCharacters), { encoding: 'utf8' });
                }
                alert('saved'); // TODO: Proper alert
            }
        });
    };
    cCHARACTERBUILDER.prototype.handleImageClick = function (evt) {
        var target = evt.target; // TODO: Should put proper checks around this
        var sides = [0, 0, 0, 0];
        var gender = target.getAttribute('data-gender');
        var type = target.getAttribute('data-type');
        var index = target.getAttribute('data-index');
        var color = target.getAttribute('data-color');
        var isBody = false;
        if (target.getAttribute('data-body') === '1') {
            isBody = true;
        }
        if (target.getAttribute('data-front') == '1') {
            sides[0] = 1;
        }
        if (target.getAttribute('data-back') == '1') {
            sides[1] = 1;
        }
        if (target.getAttribute('data-middle') == '1') {
            sides[2] = 1;
        }
        if (target.getAttribute('data-top') == '1') {
            sides[3] = 1;
        }
        if (isBody) {
            if (index !== 'none') {
                this.images['cg_body'].src = 'chargen/image/' + gender + '/body/' + index + '_' + color + '.png';
            }
            else {
                this.images['cg_body'].src = 'chargen/image/' + gender + '/body/none.png';
            }
            // TODO: For all of these onerror and onload events, can we use event listeners instead and then also use methods instead of inlines functions so we can also use "this" references?
            this.images['cg_body'].onerror = function () {
                CHARACTERBUILDER.images['cg_body'].setAttribute('data-include', '0');
                CHARACTERBUILDER.generateCharacter();
            };
            this.images['cg_body'].onload = function () {
                CHARACTERBUILDER.images['cg_body'].setAttribute('data-include', '1');
                CHARACTERBUILDER.generateCharacter();
            };
        }
        else {
            var frontEl_1 = this.images['cg_' + type + '_f'];
            frontEl_1.onerror = function () {
                frontEl_1.setAttribute('data-include', '0');
                CHARACTERBUILDER.generateCharacter();
            };
            frontEl_1.onload = function () {
                frontEl_1.setAttribute('data-include', '1');
                CHARACTERBUILDER.generateCharacter();
            };
            if (sides[0]) {
                // TODO: Maybe we can setup some common path prefix variables in a more global level to make this easier to read?
                frontEl_1.src = 'chargen/image/' + gender + '/' + type + '/' + 'front_' + gender + '/' + index + '_' + color + '.png';
            }
            else {
                frontEl_1.src = 'chargen/image/' + gender + '/' + type + '/' + 'front_' + gender + '/none.png';
            }
            var backEl_1 = this.images['cg_' + type + '_b'];
            backEl_1.onerror = function () {
                backEl_1.setAttribute('data-include', '0');
                CHARACTERBUILDER.generateCharacter();
            };
            backEl_1.onload = function () {
                backEl_1.setAttribute('data-include', '1');
                CHARACTERBUILDER.generateCharacter();
            };
            if (sides[1]) {
                backEl_1.src = 'chargen/image/' + gender + '/' + type + '/' + 'back_' + gender + '/' + index + '_' + color + '.png';
            }
            else {
                backEl_1.src = 'chargen/image/' + gender + '/' + type + '/' + 'back_' + gender + '/none.png';
            }
            // TODO: Sometimes these elements do not exist. Don't do anything with them if they don't
            var middleEl_1 = this.images['cg_' + type + '_m'];
            middleEl_1.onerror = function () {
                middleEl_1.setAttribute('data-include', '0');
                CHARACTERBUILDER.generateCharacter();
            };
            middleEl_1.onload = function () {
                middleEl_1.setAttribute('data-include', '1');
                CHARACTERBUILDER.generateCharacter();
            };
            if (sides[2]) {
                middleEl_1.src = 'chargen/image/' + gender + '/' + type + '/' + 'middle_' + gender + '/' + index + '_' + color + '.png';
            }
            else {
                middleEl_1.src = 'chargen/image/' + gender + '/' + type + '/' + 'middle_' + gender + '/none.png';
            }
            var topEl_1 = this.images['cg_' + type + '_t'];
            topEl_1.onerror = function () {
                topEl_1.setAttribute('data-include', '0');
                CHARACTERBUILDER.generateCharacter();
            };
            topEl_1.onload = function () {
                topEl_1.setAttribute('data-include', '1');
                CHARACTERBUILDER.generateCharacter();
            };
            if (sides[3]) {
                topEl_1.src = 'chargen/image/' + gender + '/' + type + '/' + 'top_' + gender + '/' + index + '_' + color + '.png';
            }
            else {
                topEl_1.src = 'chargen/image/' + gender + '/' + type + '/' + 'top_' + gender + '/none.png';
            }
        }
    };
    cCHARACTERBUILDER.prototype.generateCharacter = function () {
        this.contexts['canvas_character'].clearRect(0, 0, this.canvases['canvas_character'].width, this.canvases['canvas_character'].height);
        var images = SF.qsa('#character_image_container img');
        if (images) {
            for (var m in images) {
                var img = images[m];
                if (img instanceof HTMLElement) {
                    var charImg = img;
                    if (charImg.id === 'cg_body') {
                        this.contexts['canvas_character'].drawImage(charImg, 0, 0);
                    }
                    else {
                        var dInclude = charImg.getAttribute('data-include');
                        if (dInclude !== '' && dInclude !== null) {
                            var include = parseInt(dInclude);
                            if (include) {
                                this.contexts['canvas_character'].drawImage(charImg, 0, 0);
                            }
                        }
                    }
                }
            }
        }
    };
    cCHARACTERBUILDER.prototype.preloadImages = function (gender, from) {
        // TODO: Can these functions be methods instead of inline functions?
        function generateImageElement(gender, type, index, color, colors) {
            var imgElement = SF.ce('img');
            if (imgElement instanceof HTMLElement) {
                imgElement.setAttribute('data-src', 'chargen/icon/' + gender + '/' + type + '/' + index + '_' + color + '.gif');
                imgElement.setAttribute('data-front', '0');
                if (colors[color]['front']) {
                    imgElement.setAttribute('data-front', '1');
                }
                imgElement.setAttribute('data-back', '0');
                if (colors[color]['back']) {
                    imgElement.setAttribute('data-back', '1');
                }
                imgElement.setAttribute('data-middle', '0');
                if (colors[color]['middle']) {
                    imgElement.setAttribute('data-middle', '1');
                }
                imgElement.setAttribute('data-top', '0');
                if (colors[color]['top']) {
                    imgElement.setAttribute('data-top', '1');
                }
                imgElement.setAttribute('data-body', '0');
                imgElement.setAttribute('data-gender', gender);
                imgElement.setAttribute('data-type', type);
                imgElement.setAttribute('data-index', index);
                imgElement.setAttribute('data-color', color);
                return imgElement;
            }
        }
        function generateBodyImageElement(gender, type, index, color) {
            var imgElement = SF.ce('img');
            if (imgElement instanceof HTMLElement) {
                imgElement.setAttribute('data-src', 'chargen/icon/' + gender + '/' + type + '/' + index + '_' + color + '.gif');
                imgElement.setAttribute('data-front', '0');
                imgElement.setAttribute('data-back', '0');
                imgElement.setAttribute('data-middle', '0');
                imgElement.setAttribute('data-top', '0');
                imgElement.setAttribute('data-body', '1');
                imgElement.setAttribute('data-gender', gender);
                imgElement.setAttribute('data-type', type);
                imgElement.setAttribute('data-index', index);
                imgElement.setAttribute('data-color', color);
                return imgElement;
            }
        }
        function generateNoneImageElement(gender, type, isBody) {
            var imgElement = SF.ce('img');
            if (imgElement instanceof HTMLElement) {
                imgElement.setAttribute('data-src', 'chargen/icon/' + gender + '/' + type + '/' + 'none.gif');
                imgElement.setAttribute('data-front', '0');
                imgElement.setAttribute('data-back', '0');
                imgElement.setAttribute('data-middle', '0');
                imgElement.setAttribute('data-top', '0');
                imgElement.setAttribute('data-body', isBody);
                imgElement.setAttribute('data-gender', gender);
                imgElement.setAttribute('data-type', type);
                imgElement.setAttribute('data-index', 'none');
                imgElement.setAttribute('data-color', 'none');
                return imgElement;
            }
        }
        for (var type in from) {
            if (type !== 'body') {
                for (var index in from[type]) {
                    if (index !== 'none') {
                        var colors = from[type][index];
                        for (var c in colors) {
                            var imgElement = generateImageElement(gender, type, index, c, colors);
                            this.iImages.push(imgElement);
                        }
                    }
                    else {
                        var imgElement = generateNoneImageElement(gender, type, 0);
                        this.iImages.push(imgElement);
                    }
                }
            }
            else {
                for (var index in from[type]) {
                    if (index !== 'none') {
                        var colors = from[type][index];
                        for (var c in colors) {
                            var color = colors[c];
                            var imgElement = generateBodyImageElement(gender, type, index, color);
                            this.iImages.push(imgElement);
                        }
                    }
                    else {
                        var imgElement = generateNoneImageElement(gender, type, 1);
                        this.iImages.push(imgElement);
                    }
                }
            }
        }
    };
    return cCHARACTERBUILDER;
}());
var CHARACTERBUILDER = cCHARACTERBUILDER.Instance;
CHARACTERBUILDER.initialize();
