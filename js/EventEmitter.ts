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
    // Emits a single event
    emit(eventName: string): void;
    // Flushes all events in a queue
    flush(...args: any[]): void;
    // Queues an event internally for flushing
    queue(eventName: string): void;
    // A listener subscribes to a particular event any time it's emitted
    on(eventName: string, subscriber: (...args: any[]) => void): void;
    // A listener subscribes to a particular event for one emission only
    once(eventName: string, subscriber: (...args: any[]) => void): void;
    // Add an event so it's available for subscribers and emissions
    registerEvent(name: string): void;
    // Remove an event entirely
    // removeEvent(name: string): void;
    // Remove all subscribers from event
    // removeEventSubscribers(name: string): void;
}

interface IEventEmitterEventSubs {
    once: Array<any>;
    on: Array<any>
}
interface IEventEmitterEvent {
    [key: string]: IEventEmitterEventSubs;
}

class EventEmitter implements IEventEmitter {
    private _queue: Array<string>;
    private _events: IEventEmitterEvent;

    constructor() {
        this._events = {};
        this._queue = [];
    }
    registerEvent(name: string) {
        if (this._events[name] === undefined) {
            this._events[name] = {
                once: [],
                on: []
            }
        }
    }
    on(eventName: string, subscriber: (...args: any[]) => void) {
        this.registerEvent(eventName);
        this._events[eventName].on.push(subscriber);
    }
    once(eventName: string, subscriber: (...args: any[]) => void) {
        this.registerEvent(eventName);
        this._events[eventName].once.push(subscriber);
    }
    emit(eventName: string, ...args: any[]) {
        if (this._events[eventName] === undefined) { return false; }
        let event = this._events[eventName];
        for (let x = 0; x < event.on.length; ++x ) {
            let subscriber = event.on[x];
            subscriber.call(this, ...args);
        }
        for (let x = 0; x < event.once.length; ++x ) {
            let subscriber = event.once[x];
            subscriber.call(this, ...args);
            delete(event.once[x]);
        }
    }
    queue(eventName: string) {
        if (this._events[eventName] === undefined) { return false; }
        this._queue.push(eventName);
    }
    flush(...args: any[]) {
        for(let x = 0; x < this._queue.length; ++x) {
            let eventName = this._queue[x];
            this.emit(eventName, ...args);
        }
    }
}

let test = new EventEmitter();
let func = function (one: string, two: number) {
    console.log(one, two);
};
test.on('TEST', func);
test.queue('TEST');
test.queue('TEST2');
// test.emit('TEST', 'poop', 'my scoop', 'hadoop');
test.flush('poop','my scoop', 'hadoop');