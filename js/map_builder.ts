interface IMapBuilder {
    initialize(): void;
}

class cMAPBUILDER implements IMapBuilder {
    private static _instance: cMAPBUILDER;
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    initialize() {}
}