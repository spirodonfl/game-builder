// Only for reference purposes. Will go away.
// interface SampleElements {
//     one: HTMLInputElement;
//     two: HTMLAnchorElement;
//     three: HTMLButtonElement;
//     four: HTMLCanvasElement;
//     five: HTMLDivElement;
//     six: HTMLDocument;
//     seven: HTMLElement;
//     eight: HTMLImageElement;
//     nine: HTMLOptionElement;
//     ten: HTMLOptionsCollection;
//     eleven: HTMLTextAreaElement;
//     twelve: CanvasRenderingContext2D;
// }

interface ISF {
    doc: HTMLDocument;
    gei(id: string): false|HTMLElement;
    ce(type: string): false|HTMLElement;
}

class cSF implements ISF {
    private static _instance: cSF;
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    doc: HTMLDocument;
    constructor() {
        this.doc = window.document || document;
    }
    gei(id: string) {
        let element = this.doc.getElementById(id);
        if (element instanceof HTMLElement) {
            return element;
        }
        return false;
    }
    ce(type: string) {
        let element = this.doc.createElement(type);
        if (element instanceof HTMLElement) {
            return element;
        }
        return false;
    }
}
const SF = cSF.Instance;