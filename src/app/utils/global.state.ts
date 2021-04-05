import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GlobalState {

    private _data = new Subject<Object>();
    private _dataStream$ = this._data.asObservable();

    private _subscriptions: Map<string, Array<Function>> = new Map<string, Array<Function>>();

    constructor() {
        this._dataStream$.subscribe((data) => this._onEvent(data));
    }

    notifyDataChanged(event, value) {
        let current = this._data[event];
        if (current !== value) {
            this._data[event] = value;

            this._data.next({
                event: event,
                data: this._data[event]
            });
        }
    }

    notifyData(event, value) {


        //temporary solution to resolve back button issue
        this._data['checkoutRoutChanged'] = 0;

        this._data[event] = value;
        this._data.next({
            event: event,
            data: this._data[event]
        });
    }

    subscribe(event: string, callback: Function) {
        let subscribers = this._subscriptions.get(event) || [];
        subscribers.push(callback);

        this._subscriptions.set(event, subscribers);
        return subscribers.length - 1;
    }
    unsubscribe(event: string, index: number) {
        let subscribers = this._subscriptions.get(event) || [];
        if (subscribers.length - 1 >= index) {
            subscribers.splice(index, 1);
        }
        this._subscriptions.set(event, subscribers);
    }

    _onEvent(data: any) {
        let subscribers = this._subscriptions.get(data['event']) || [];

        subscribers.forEach((callback) => {
            callback.call(null, data['data']);
        });
    }
}
