interface IKeyboardKeyIDs {
    [key: string]: number
}

interface IKeyboard {
    ee: EventEmitter;
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    IDs: IKeyboardKeyIDs;
    // Listens to the window for keyboard events
    initialize(): void;
}

class cKEYBOARD implements IKeyboard {
    private static _instance: cKEYBOARD;
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    ee: EventEmitter;
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    IDs: IKeyboardKeyIDs;

    constructor() {
        this.ee = new EventEmitter();
        this.shiftKey = false;
        this.ctrlKey = false;
        this.altKey = false;

        this.IDs = {
            'h': 72, 'i': 73, 'shift': 16, 'f4': 115, 'f5': 116, 'f6': 117, 'f7': 118, 'f8': 119
        }
    }

    initialize() {
        let me = this;
        window.addEventListener('keydown', function (e) {
            let id = e.which;
            console.log('Keyboard Down ID: ' + id);
            if (id === me.IDs['shift']) {
                me.shiftKey = true;
            }
            me.ee.emit('KD:' + id);
        });
        window.addEventListener('keyup', function (e) {
            let id = e.which;
            console.log('Keyboard Up ID: ' + id);
            if (id === me.IDs['shift']) {
                me.shiftKey = false;
            }
            me.ee.emit('KU:' + id);
        });
    }
}
const KEYBOARD = cKEYBOARD.Instance;