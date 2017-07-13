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
interface IHashOfMapLayerCanvases {
    [key: string]: HTMLCanvasElement;
}
interface IHashOfMapLayerContexts {
    [key: string]: CanvasRenderingContext2D;
}
interface IHashOfHtmlSelectElements {
    [key: string]: HTMLSelectElement;
}
interface IHashOfMapDetails {
    name: string;
    width: number;
    height: number;
    layers: number;
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