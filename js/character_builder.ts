interface IHashOfSides {
    [key: string]: Array<string>;
}
interface Ixy {
    [name: string]: {[key: string]: {[key: string]: {[key: string]: any}}};
}
interface ICharacterBuilder {}

class cCHARACTERBUILDER implements ICharacterBuilder {
    private static _instance: cCHARACTERBUILDER;
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    ee: EventEmitter;
    iColors: Array<string>;
    iTypes: Array<string>;
    iSides: IHashOfSides;
    iImages: Array<any>;
    xy: Ixy;
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
        this.xy = {};
        this.ym = {};
        this.yw = {};
        this.iImages = [];

        this.dynamicChargen('ym');
        this.ym = this.xy;
        this.xy = {};
        this.dynamicChargen('yw');
        this.yw = this.xy;
        this.preloadImages('ym', this.ym);
        this.preloadImages('yw', this.yw);
        let totalImages = this.iImages.length;
        let imagesLoaded = 0;
        function checkImagesLoaded() {
            ++imagesLoaded;
            if (imagesLoaded === totalImages) {
                for (let x = 0; x < totalImages; ++x) {
                    let img = CHARACTERBUILDER.iImages[x];
                    let gender = img.getAttribute('data-gender');
                    let type = img.getAttribute('data-type');
                    let parent = document.getElementById('cf_' + gender + '_' + type);
                    img.addEventListener('click', CHARACTERBUILDER.handleImageClick.bind(CHARACTERBUILDER));
                    if (parent instanceof HTMLElement) {
                        parent.appendChild(img);
                    }
                }
            }
        }
        for (let x = 0; x < totalImages; ++x) {
            let img = this.iImages[x];
            img.addEventListener('load', checkImagesLoaded);
            img.src = img.getAttribute('data-src');
        }

        let genderSelect = SF.gei('gender');
        if (genderSelect instanceof HTMLElement) {
            genderSelect.addEventListener('change', function(e) {
                if (e.target.value === 'ym') {
                    document.getElementById('cf_ym').style.display = 'block';
                    document.getElementById('cf_yw').style.display = 'none';
                } else {
                    document.getElementById('cf_ym').style.display = 'none';
                    document.getElementById('cf_yw').style.display = 'block';
                }
            });
        }

        let saveCharacter = SF.gei('save_character');
        if (saveCharacter instanceof HTMLElement) {
            saveCharacter.addEventListener('click', function () {
                let nameInput = SF.gei('character_name');
                if (nameInput instanceof HTMLElement) {
                    let nin = <HTMLInputElement>nameInput;
                    let name = nin.value;
                    if (name === '') {
                        alert('Please enter a name for this character.'); // TODO: Proper alert
                    } else {
                        name = name.replace(/\s+/g, '-').toLowerCase();
                        let cc = SF.gei('canvas_character');
                        if (cc instanceof HTMLElement) {
                            let canvasChar = <HTMLCanvasElement>cc;
                            let data = canvasChar.toDataURL();
                            data = data.replace(/^data:image\/(png|jpg);base64,/, "");
                            require('fs').writeFileSync(name + '.png', data, 'base64'); // TODO: Save this correctly
                            alert('saved'); // TODO: Proper alert
                        }
                    }
                }
            });
        }
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
            let bodyElement = document.getElementById('cg_body');
            if (index !== 'none') {
                bodyElement.src = 'chargen/image/' + gender + '/body/' + index + '_' + color + '.png';
            } else {
                bodyElement.src = 'chargen/image/' + gender + '/body/none.png';
            }
            bodyElement.onerror = function () {
                bodyElement.setAttribute('data-include', '0');
                CHARACTERBUILDER.generateCharacter();
            }
            bodyElement.onload = function () {
                bodyElement.setAttribute('data-include', '1');
                CHARACTERBUILDER.generateCharacter();
            }
        } else {
            let frontElement = document.getElementById('cg_' + type + '_f');
            if (frontElement instanceof HTMLElement) {
                frontElement.onerror = function () {
                    frontElement.setAttribute('data-include', '0');
                    CHARACTERBUILDER.generateCharacter();
                }
                frontElement.onload = function () {
                    frontElement.setAttribute('data-include', '1');
                    CHARACTERBUILDER.generateCharacter();
                }
                if (sides[0]) {
                    frontElement.src = 'chargen/image/' + gender + '/' + type + '/' + 'front_' + gender + '/' + index + '_' + color + '.png';
                } else {
                    frontElement.src = 'chargen/image/' + gender + '/' + type + '/' + 'front_' + gender + '/none.png';
                }
            }
            let backElement = document.getElementById('cg_' + type + '_b');
            if (backElement instanceof HTMLElement) {
                backElement.onerror = function () {
                    backElement.setAttribute('data-include', '0');
                    CHARACTERBUILDER.generateCharacter();
                }
                backElement.onload = function () {
                    backElement.setAttribute('data-include', '1');
                    CHARACTERBUILDER.generateCharacter();
                }
                if (sides[1]) {
                    backElement.src = 'chargen/image/' + gender + '/' + type + '/' + 'back_' + gender + '/' + index + '_' + color + '.png';
                } else {
                    backElement.src = 'chargen/image/' + gender + '/' + type + '/' + 'back_' + gender + '/none.png';
                }
            }
            let middleElement = document.getElementById('cg_' + type + '_m');
            if (middleElement instanceof HTMLElement) {
                middleElement.onerror = function () {
                    middleElement.setAttribute('data-include', '0');
                    CHARACTERBUILDER.generateCharacter();
                }
                middleElement.onload = function () {
                    middleElement.setAttribute('data-include', '1');
                    CHARACTERBUILDER.generateCharacter();
                }
                if (sides[2]) {
                    middleElement.src = 'chargen/image/' + gender + '/' + type + '/' + 'middle_' + gender + '/' + index + '_' + color + '.png';
                } else {
                    middleElement.src = 'chargen/image/' + gender + '/' + type + '/' + 'middle_' + gender + '/none.png';
                }
            }
            let topElement = document.getElementById('cg_' + type + '_t');
            if (topElement instanceof HTMLElement) {
                topElement.onerror = function () {
                    topElement.setAttribute('data-include', '0');
                    CHARACTERBUILDER.generateCharacter();
                }
                topElement.onload = function () {
                    topElement.setAttribute('data-include', '1');
                    CHARACTERBUILDER.generateCharacter();
                }
                if (sides[3]) {
                    topElement.src = 'chargen/image/' + gender + '/' + type + '/' + 'top_' + gender + '/' + index + '_' + color + '.png';
                } else {
                    topElement.src = 'chargen/image/' + gender + '/' + type + '/' + 'top_' + gender + '/none.png';
                }
            }
        }
    }
    generateCharacter() {
        let cc = document.getElementById('canvas_character');
        let cx = cc.getContext('2d');
        cx.clearRect(0, 0, cc.width, cc.height);
        let images = document.querySelectorAll('#character_image_container img');
        for (let m in images) {
            let img = images[m];
            if (img instanceof HTMLElement) {
                if (img.id === 'cg_body') {
                    cx.drawImage(img, 0, 0);
                } else {
                    if (img.getAttribute('data-include')) {
                        let include = parseInt(img.getAttribute('data-include'));
                        if (include) {
                            cx.drawImage(img, 0, 0);
                        }
                    }
                }
            }
        }
    }
    dynamicChargen(gender: string) {
        for (let iType in CHARACTERBUILDER.iTypes) {
            let type = CHARACTERBUILDER.iTypes[iType];
            let typePath = 'chargen/icon/' + gender + '/' + type + '/';
            let files = require('fs').readdirSync(typePath);
            if (!this.xy[type]) {
                this.xy[type] = {};
            }
            if (type !== 'body') {
                for (let x = 0; x < files.length; ++x) {
                    let fileName = files[x];
                    if (fileName !== 'none.gif') {
                        let fileNameSplit = fileName.split('_');
                        let id = fileNameSplit[0];
                        let color = fileNameSplit[1];
                        color = color.replace(/\.gif/, '');

                        if (!this.xy[type][id]) {
                            this.xy[type][id] = {};
                        }
                        if (!this.xy[type][id][color]) {
                            this.xy[type][id][color] = {};
                        }

                        let has = {'front': false, 'back': false, 'middle': false, 'top': false};
                        let sides = CHARACTERBUILDER.iSides[type];
                        for (let s = 0; s < sides.length; ++s) {
                            let side = sides[s];
                            let sidesPath = 'chargen/image/' + gender + '/' + type + '/' + side + '_' + gender + '/';
                            sidesPath = sidesPath + fileName.replace(/\.gif/, '.png');
                            if (require('fs').existsSync(sidesPath)) {
                                has[side] = true;
                            }
                        }

                        this.xy[type][id][color] = has;
                    } else {
                        if (!this.xy[type]['none']) {
                            this.xy[type]['none'] = 1;
                        }
                    }
                }
            } else {
                for (let x = 0; x < files.length; ++x) {
                    let fileName = files[x];
                    if (fileName !== 'none.gif') {
                        let fileNameSplit = fileName.split('_');
                        let id = fileNameSplit[0];
                        let color = fileNameSplit[1];
                        color = color.replace(/\.gif/, '');

                        if (!this.xy[type][id]) {
                            this.xy[type][id] = [];
                        }
                        this.xy[type][id].push(color);
                    } else {
                        if (!this.xy[type]['none']) {
                            this.xy[type]['none'] = 1;
                        }
                    }
                }
            }
        }
    }
    preloadImages(gender: string, from: Object) {
        function generateImageElement(gender: any, type: any, index: any, color: any, colors: any) {
            let imgElement = document.createElement('img');
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

        function generateBodyImageElement(gender: any, type: any, index: any, color: any) {
            let imgElement = document.createElement('img');
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
        function generateNoneImageElement(gender: any, type: any, isBody: any) {
            let imgElement = document.createElement('img');
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
        for (let type in from) {
            if (type !== 'body') {
                for (let index in from[type]) {
                    if (index !== 'none') {
                        let colors = from[type][index];
                        for (let c in colors) {
                            let color = c;
                            let imgElement = generateImageElement(gender, type, index, color, colors);
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