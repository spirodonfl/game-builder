interface SampleElements {
    one: HTMLInputElement;
    two: HTMLAnchorElement;
    three: HTMLButtonElement;
    four: HTMLCanvasElement;
    five: HTMLDivElement;
    six: HTMLDocument;
    seven: HTMLElement;
    eight: HTMLImageElement;
    nine: HTMLOptionElement;
    ten: HTMLOptionsCollection;
    eleven: HTMLTextAreaElement;
}

interface IEventEmitter {
    emit(eventName: string): void; // Emits a single event
    flush(): void; // Flushes all events in a queue
    queue(): void; // Queues an event internally for flushing
    on(eventName: string, subscriber: (...args: any[]) => void): void; // A listener subscribes to a particular event any time it's emitted
    once(eventName: string, subscriber: (...args: any[]) => void): void; // A listener subscribes to a particular event for one emission only
}

class EventEmitter implements IEventEmitter {
    private _subscribers: Array<() => void>; // TODO: Should this be an object or function?
    // private _subscribers: Array<(data: string) => void>;
    // private _subscribers: Array<object>;
    // private _subscribers: Array<any>;
    private _events: Array<string>;
    private _queue: Array<string>;

    constructor() {
        this._subscribers = [];
        this._events = [];
        this._queue = [];
    }
    on(eventName: string, subscriber: (...args: any[]) => void) {
        this._subscribers.push(subscriber);
        this._events.push(eventName);
    }
    once(eventName: string, subscriber: (...args: any[]) => void) {
        this._subscribers.push(subscriber);
        this._events.push(eventName);
    }
    emit(eventName: string, ...args: any[]) {
        let exists = false;
        for (let x = 0; x < this._events.length; ++x ) {
            if (this._events[x] === eventName) {
                exists = true;
                break;
            }
        }
        if (exists) {
            console.log('YEP');
        }
        for (let x = 0; x < this._subscribers.length; ++x) {
            let subscriber = this._subscribers[x];
            subscriber.call(this, ...args);
        }
    }
    queue() {}
    flush() {}
}

let test = new EventEmitter();
let func = function (one: string, two: number) {
    console.log(one, two);
};
test.on('TEST', func);
test.emit('TEST', 'poop', 'my scoop', 'hadoop');