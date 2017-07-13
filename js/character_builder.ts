class cCHARACTERBUILDER implements ICharacterBuilder {
    private static _instance: cCHARACTERBUILDER;
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    ee: EventEmitter;
    iColors: Array<string>;
    iTypes: Array<string>;
    iSides: IHashOfSides;
    windows: IHashOfHtmlDivElements;
    divs: IHashOfHtmlDivElements;
    buttons: IHashOfHtmlButtonElements;
    inputs: IHashOfHtmlInputElements;
    selects: IHashOfHtmlSelectElements;
    canvases: IHashOfCanvasElements;
    contexts: IHashOfContexts;
    images: IHashOfHtmlImageElements;
    dbCharacters: basicHash;

    // Not in the interface because implementation details might be different
    windowIDs: Array<string>;
    buttonIDs: Array<string>;
    inputIDs: Array<string>;
    selectIDs: Array<string>;
    divIDs: Array<string>;
    canvasIDs: Array<string>;
    imageIDs: Array<string>;
    iImages: Array<any>;
    ym: {};
    yw: {};

    initialize() {
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
        this.dbCharacters = JSON.parse(require('fs').readFileSync('assets/characters.json', {encoding: 'utf8'})); // TODO: Error out if this does not exist or create a blank one

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
        for (let x = 0; x < this.windowIDs.length; ++x) {
            let id = this.windowIDs[x];
            let el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.windows[id] = <HTMLDivElement>el;
            }
        }
        this.inputIDs = ['character_name'];
        for (let x = 0; x < this.inputIDs.length; ++x) {
            let id = this.inputIDs[x];
            let el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.inputs[id] = <HTMLInputElement>el;
            }
        }
        this.selectIDs = ['gender'];
        for (let x = 0; x < this.selectIDs.length; ++x) {
            let id = this.selectIDs[x];
            let el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.selects[id] = <HTMLSelectElement>el;
            }
        }
        this.buttonIDs = ['save_character'];
        for (let x = 0; x < this.buttonIDs.length; ++x) {
            let id = this.buttonIDs[x];
            let el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.buttons[id] = <HTMLButtonElement>el;
            }
        }
        this.divIDs = ['cf_ym', 'cf_yw', 'cf_ym_acce1', 'cf_ym_acce2', 'cf_ym_body', 'cf_ym_hair', 'cf_ym_hairop', 'cf_ym_mante', 'cf_ym_option', 'cf_yw_acce1', 'cf_yw_acce2', 'cf_yw_body', 'cf_yw_hair', 'cf_yw_hairop', 'cf_yw_mante', 'cf_yw_option'];
        for (let x = 0; x < this.divIDs.length; ++x) {
            let id = this.divIDs[x];
            let el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.divs[id] = <HTMLDivElement>el;
            }
        }
        this.canvasIDs = ['canvas_character'];
        for (let x = 0; x < this.canvasIDs.length; ++x) {
            let id = this.canvasIDs[x];
            let el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.canvases[id] = <HTMLCanvasElement>el;
                let ctx = this.canvases[id].getContext('2d');
                if (ctx instanceof CanvasRenderingContext2D) {
                    this.contexts[id] = ctx;
                }
            }
        }
        this.imageIDs = ['cg_option_b', 'cg_acce1_b', 'cg_hairop_b', 'cg_hair_b', 'cg_mante_b', 'cg_acce2_b', 'cg_body', 'cg_hair_f', 'cg_acce2_m', 'cg_mante_f', 'cg_acce1_f', 'cg_hair_t', 'cg_acce2_f', 'cg_hairop_f', 'cg_acce1_t', 'cg_option_f'];
        for (let x = 0; x < this.imageIDs.length; ++x) {
            let id = this.imageIDs[x];
            let el = SF.gei(id);
            if (el instanceof HTMLElement) {
                this.images[id] = <HTMLImageElement>el;
            }
        }

        if (require('fs').existsSync('chargen/chargen_assets.json')) {
            var assets = require('fs').readFileSync('chargen/chargen_assets.json', {encoding: 'utf8'});
            assets = JSON.parse(assets);
            this.ym = assets.ym;
            this.yw = assets.yw;
        } else {
            alert('Cannot find chargen assets JSON!'); // TODO: Proper alert
            // TODO: At this point, the entire page should just top and not continue
        }

        this.preloadImages('ym', this.ym);
        this.preloadImages('yw', this.yw);
        // TODO: Can we take out the inline checkImagesLoaded function and make it its own thing? That way we can also use a "this" reference too.
        let totalImages = this.iImages.length;
        let imagesLoaded = 0;
        function checkImagesLoaded() {
            ++imagesLoaded;
            if (imagesLoaded === totalImages) {
                for (let x = 0; x < totalImages; ++x) {
                    let img = CHARACTERBUILDER.iImages[x];
                    let gender = img.getAttribute('data-gender');
                    let type = img.getAttribute('data-type');
                    let parent = CHARACTERBUILDER.divs['cf_' + gender + '_' + type];
                    img.addEventListener('click', CHARACTERBUILDER.handleImageClick.bind(CHARACTERBUILDER));
                    parent.appendChild(img);
                }
            }
        }
        for (let x = 0; x < totalImages; ++x) {
            let img = this.iImages[x];
            img.addEventListener('load', checkImagesLoaded);
            img.src = img.getAttribute('data-src');
        }

        // TODO: Can we use a method instead of an inline function? That way we can also use "this" references.
        this.selects['gender'].addEventListener('change', function(e) {
            if (e.target && e.target instanceof HTMLSelectElement) {
                if (e.target.value === 'ym') {
                    CHARACTERBUILDER.divs['cf_ym'].style.display = 'block';
                    CHARACTERBUILDER.divs['cf_yw'].style.display = 'none';
                } else {
                    CHARACTERBUILDER.divs['cf_ym'].style.display = 'none';
                    CHARACTERBUILDER.divs['cf_yw'].style.display = 'block';
                }
            }
        });

        // TODO: Can we use a method instead of an inline function? That way we can also use "this" references.
        this.buttons['save_character'].addEventListener('click', function () {
            let name = CHARACTERBUILDER.inputs['character_name'].value;
            if (name === '') {
                alert('Please enter a name for this character.'); // TODO: Proper alert
            } else {
                name = name.replace(/\s+/g, '-').toLowerCase();
                let data = CHARACTERBUILDER.canvases['canvas_character'].toDataURL();
                data = data.replace(/^data:image\/(png|jpg);base64,/, "");
                require('fs').writeFileSync('assets/characters/' + name + '.png', data, 'base64');
                if (!CHARACTERBUILDER.dbCharacters[name]) {
                    CHARACTERBUILDER.dbCharacters[name] = "";
                    require('fs').writeFileSync('assets/characters.json', JSON.stringify(CHARACTERBUILDER.dbCharacters), {encoding: 'utf8'});
                }
                alert('saved'); // TODO: Proper alert
            }
        });
    }
    handleImageClick(evt: Event) {
        let target = <HTMLImageElement>evt.target; // TODO: Should put proper checks around this
        let sides = [0, 0, 0, 0];
        let gender = target.getAttribute('data-gender');
        let type = target.getAttribute('data-type');
        let index = target.getAttribute('data-index');
        let color = target.getAttribute('data-color');
        let isBody = false;
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
            } else {
                this.images['cg_body'].src = 'chargen/image/' + gender + '/body/none.png';
            }
            // TODO: For all of these onerror and onload events, can we use event listeners instead and then also use methods instead of inlines functions so we can also use "this" references?
            this.images['cg_body'].onerror = function() {
                CHARACTERBUILDER.images['cg_body'].setAttribute('data-include', '0');
                CHARACTERBUILDER.generateCharacter();
            }
            this.images['cg_body'].onload = function() {
                CHARACTERBUILDER.images['cg_body'].setAttribute('data-include', '1');
                CHARACTERBUILDER.generateCharacter();
            }
        } else {
            let frontEl = this.images['cg_' + type + '_f'];
            frontEl.onerror = function () {
                frontEl.setAttribute('data-include', '0');
                CHARACTERBUILDER.generateCharacter();
            }
            frontEl.onload = function () {
                frontEl.setAttribute('data-include', '1');
                CHARACTERBUILDER.generateCharacter();
            }
            if (sides[0]) {
                // TODO: Maybe we can setup some common path prefix variables in a more global level to make this easier to read?
                frontEl.src = 'chargen/image/' + gender + '/' + type + '/' + 'front_' + gender + '/' + index + '_' + color + '.png';
            } else {
                frontEl.src = 'chargen/image/' + gender + '/' + type + '/' + 'front_' + gender + '/none.png';
            }

            let backEl = this.images['cg_' + type + '_b'];
            backEl.onerror = function () {
                backEl.setAttribute('data-include', '0');
                CHARACTERBUILDER.generateCharacter();
            }
            backEl.onload = function () {
                backEl.setAttribute('data-include', '1');
                CHARACTERBUILDER.generateCharacter();
            }
            if (sides[1]) {
                backEl.src = 'chargen/image/' + gender + '/' + type + '/' + 'back_' + gender + '/' + index + '_' + color + '.png';
            } else {
                backEl.src = 'chargen/image/' + gender + '/' + type + '/' + 'back_' + gender + '/none.png';
            }
            // TODO: Sometimes these elements do not exist. Don't do anything with them if they don't
            let middleEl = this.images['cg_' + type + '_m'];
            middleEl.onerror = function () {
                middleEl.setAttribute('data-include', '0');
                CHARACTERBUILDER.generateCharacter();
            }
            middleEl.onload = function () {
                middleEl.setAttribute('data-include', '1');
                CHARACTERBUILDER.generateCharacter();
            }
            if (sides[2]) {
                middleEl.src = 'chargen/image/' + gender + '/' + type + '/' + 'middle_' + gender + '/' + index + '_' + color + '.png';
            } else {
                middleEl.src = 'chargen/image/' + gender + '/' + type + '/' + 'middle_' + gender + '/none.png';
            }

            let topEl = this.images['cg_' + type + '_t'];
            topEl.onerror = function () {
                topEl.setAttribute('data-include', '0');
                CHARACTERBUILDER.generateCharacter();
            }
            topEl.onload = function () {
                topEl.setAttribute('data-include', '1');
                CHARACTERBUILDER.generateCharacter();
            }
            if (sides[3]) {
                topEl.src = 'chargen/image/' + gender + '/' + type + '/' + 'top_' + gender + '/' + index + '_' + color + '.png';
            } else {
                topEl.src = 'chargen/image/' + gender + '/' + type + '/' + 'top_' + gender + '/none.png';
            }
        }
    }
    generateCharacter() {
        this.contexts['canvas_character'].clearRect(0, 0, this.canvases['canvas_character'].width, this.canvases['canvas_character'].height);
        let images = SF.qsa('#character_image_container img');
        if (images) {
            for (let m in images) {
                let img = images[m];
                if (img instanceof HTMLElement) {
                    let charImg = <HTMLImageElement>img;
                    if (charImg.id === 'cg_body') {
                        this.contexts['canvas_character'].drawImage(charImg, 0, 0);
                    } else {
                        let dInclude = charImg.getAttribute('data-include');
                        if (dInclude !== '' && dInclude !== null) {
                            let include = parseInt(dInclude);
                            if (include) {
                                this.contexts['canvas_character'].drawImage(charImg, 0, 0);
                            }
                        }
                    }
                }
            }
        }
    }
    preloadImages(gender: string, from: any) {
        // TODO: Can these functions be methods instead of inline functions?
        function generateImageElement(gender: any, type: any, index: any, color: any, colors: any) {
            let imgElement = SF.ce('img');
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

        function generateBodyImageElement(gender: any, type: any, index: any, color: any) {
            let imgElement = SF.ce('img');
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
        function generateNoneImageElement(gender: any, type: any, isBody: any) {
            let imgElement = SF.ce('img');
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
        for (let type in from) {
            if (type !== 'body') {
                for (let index in from[type]) {
                    if (index !== 'none') {
                        let colors = from[type][index];
                        for (let c in colors) {
                            let imgElement = generateImageElement(gender, type, index, c, colors);
                            this.iImages.push(imgElement);
                        }
                    } else {
                        let imgElement = generateNoneImageElement(gender, type, 0);
                        this.iImages.push(imgElement);
                    }
                }
            } else {
                for (let index in from[type]) {
                    if (index !== 'none') {
                        let colors = from[type][index];
                        for (let c in colors) {
                            let color = colors[c];
                            let imgElement = generateBodyImageElement(gender, type, index, color);
                            this.iImages.push(imgElement);
                        }
                    } else {
                        let imgElement = generateNoneImageElement(gender, type, 1);
                        this.iImages.push(imgElement);
                    }
                }
            }
        }
    }
}
let CHARACTERBUILDER = cCHARACTERBUILDER.Instance;
CHARACTERBUILDER.initialize();