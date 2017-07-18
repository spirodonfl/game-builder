interface basicHash {
    [key: string]: any;
}
interface IHashOfHtmlImageElements {
    [key: string]: HTMLImageElement;
}
interface IHashOfSides {
    [key: string]: Array<string>;
}
interface IHashOfHtmlElements {
    [key: string]: HTMLElement;
}
interface IHashOfHtmlDivElements {
    [key: string]: HTMLDivElement;
}
interface IHashOfHtmlInputElements {
    [key: string]: HTMLInputElement;
}
interface IHashOfHtmlButtonElements {
    [key: string]: HTMLButtonElement;
}
interface IHashOfHtmlCanvasElements {
    [key: string]: HTMLCanvasElement;
}
interface IHashOfContexts {
    [key: string]: CanvasRenderingContext2D;
}
interface IHashOfHtmlSelectElements {
    [key: string]: HTMLSelectElement;
}
interface IHashOfHtmlLIElements {
    [key: string]: HTMLLIElement;
}
interface IHashOfMapDetails {
    name: string;
    width: number;
    height: number;
    layers: number;
    layerNames: Array<string>;
}
interface IMapBuilder {
    ee: EventEmitter;
    windows: IHashOfHtmlDivElements;
    divs: IHashOfHtmlDivElements;
    buttons: IHashOfHtmlButtonElements;
    inputs: IHashOfHtmlInputElements;
    // Represents the loaded map details
    mapDetails: IHashOfMapDetails;
    mapLayerCanvases: IHashOfMapLayerCanvases;
    mapLayerContexts: IHashOfMapLayerContexts;
    activeLayer: number;
    // Indicates whether clicking should actually clear the selected area instead of a place a tile there
    clearClick: boolean;
    // If this is false, only the active layer is seen in full strength. The other layers are muted so they're less visible. Makes it easier to distinguish layers.
    allLayersActive: boolean;
    selectedTileImage: HTMLImageElement;

    // Grabs all the windows, buttons, etc..., adds event listeners
    initialize(): void;
    hideAllWindows(): void;
    createNewMap(): void;
    saveMap(): void;
    loadMap(): void;
    addNewLayer(): void;
    deleteLayer(layerID: number): void;
    switchToPreviousLayer(): void;
    switchToNextLayer(): void;
    setActiveLayer(layerID: number): void;
}
interface ICharacterBuilder {
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
    dbCharacters: basicHash;

    initialize(): void;
    generateCharacter(): void;
}
interface ITileBuilder {
    // Reference to the window that you can hide or show and where the form is to save the tile
    mainWindow: HTMLElement;
    // Instead of checking the "display" style attribute, we just keep a boolean to see if the window is showing or not
    mainWindowHidden: boolean;
    // The canvas that houses the tileset image
    canvasTileset: HTMLCanvasElement;
    // The context for the tileset canvas
    contextTileset: CanvasRenderingContext2D;
    // The canvas that houses the 32x32 selection that you make when you click somewhere on the big tileset canvas
    canvasTmp: HTMLCanvasElement;
    // The context for the canvas that houses the selected tile
    contextTmp: CanvasRenderingContext2D;
    // The input element that contains the name of the tile
    nameOfTile: HTMLInputElement;
    // The actual image element that is in the window to show you what you've selected as you save
    selectedImage: HTMLImageElement;

    initialize(): void;
    // Loads the tileset image and then updates the width / height of appropriate elements to match the image
    setupCanvas(): void;
    // Listens to thinks like the hover mouse trap, save button, etc...
    setupListeners(): void;
}