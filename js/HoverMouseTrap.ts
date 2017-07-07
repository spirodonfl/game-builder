interface IHoverMouseTrap {}

class cHOVERMOUSETRAP implements IHoverMouseTrap {
    private static _instance: cHOVERMOUSETRAP;
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    ee: EventEmitter;
    stickyGrid: boolean;
    divMouseTrap: HTMLDivElement;
    canvasHover: HTMLCanvasElement;

    constructor() {
        this.ee = new EventEmitter();
        this.stickyGrid = false;
    }
    initialize() {
        let elementMouseTrap = SF.gei('mouse_trap');
        if (elementMouseTrap instanceof HTMLDivElement) {
            this.divMouseTrap = elementMouseTrap;
        }
        let elementCanvasHover = SF.gei('canvas_hover');
        if (elementCanvasHover instanceof HTMLCanvasElement) {
            this.canvasHover = elementCanvasHover;
        }
    }
}
const HOVERMOUSETRAP = cHOVERMOUSETRAP.Instance;