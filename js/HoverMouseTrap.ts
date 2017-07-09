interface IHoverMouseTrap {
    ee: EventEmitter;
    stickyGrid: boolean;
    drawMove: boolean;
    clickDown: boolean;
    // Grabs initial div and canvas element and then listens to the mouse
    initialize(): void;
    // Activates when the mouse moves over the div element
    handleMouseMove(e: MouseEvent): void;
    // Activates when the mouse is clicked over the div element
    handleMouseDown(e: MouseEvent): void;
    // Activates when the mouse is let go (unclicked) over the div element
    handleMouseUp(e: MouseEvent): void;
    // Returns a grid based set of coordinates (based on 32x32 per square grid)
    calculateCoordinates(coordX: number, coordY: number): Array<number>;
}

class cHOVERMOUSETRAP implements IHoverMouseTrap {
    private static _instance: cHOVERMOUSETRAP;
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    ee: EventEmitter;
    stickyGrid: boolean;
    drawMove: boolean;
    divMouseTrap: HTMLDivElement;
    canvasHover: HTMLCanvasElement;
    contextHover: CanvasRenderingContext2D|null;
    clickDown: boolean;

    constructor() {
        this.ee = new EventEmitter();
        this.stickyGrid = false;
        this.drawMove = false;
        this.clickDown = false;
    }
    initialize() {
        let elementMouseTrap = SF.gei('mouse_trap');
        if (elementMouseTrap instanceof HTMLDivElement) {
            this.divMouseTrap = elementMouseTrap;
            this.divMouseTrap.addEventListener( 'mousemove', this.handleMouseMove.bind(this) );
            this.divMouseTrap.addEventListener( 'mousedown', this.handleMouseDown.bind(this) );
            this.divMouseTrap.addEventListener( 'mouseup', this.handleMouseUp.bind(this) );
        }
        let elementCanvasHover = SF.gei('canvas_hover');
        if (elementCanvasHover instanceof HTMLCanvasElement) {
            this.canvasHover = elementCanvasHover;
            this.contextHover = this.canvasHover.getContext('2d');
        }
    }
    calculateCoordinates(coordX: number, coordY: number) {
        let x = 0;
        let y = 0;
        if (this.stickyGrid) {
            x = Math.floor((coordX + SF.doc.body.scrollLeft) / 32) * 32;
            y = Math.floor((coordY + SF.doc.body.scrollTop) / 32) * 32;
        } else {
            x = (coordX - 16) + SF.doc.body.scrollLeft;
            y = (coordY - 16) + SF.doc.body.scrollTop;
        }

        return [x, y];
    }
    handleMouseMove(e: MouseEvent) {
        let coordinates = this.calculateCoordinates(e.clientX, e.clientY);
        if (this.drawMove && this.contextHover) {
            this.contextHover.clearRect(0, 0, this.canvasHover.width, this.canvasHover.height);
            this.contextHover.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this.contextHover.fillRect(coordinates[0], coordinates[1], 32, 32);
        }
        this.ee.emit('Mouse Move', coordinates[0], coordinates[1]);
    }
    handleMouseDown(e: MouseEvent) {
        this.clickDown = true;
        let coordinates = this.calculateCoordinates(e.clientX, e.clientY);
        this.ee.emit('Mouse Down', coordinates[0], coordinates[1]);
    }
    handleMouseUp(e: MouseEvent) {
        this.clickDown = true;
        let coordinates = this.calculateCoordinates(e.clientX, e.clientY);
        this.ee.emit('Mouse Up', coordinates[0], coordinates[1]);
    }
}
const HOVERMOUSETRAP = cHOVERMOUSETRAP.Instance;