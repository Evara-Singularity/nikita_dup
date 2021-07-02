import { Injectable } from '@angular/core';
import { ToastMessage } from './toast-message.module';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ToastMessageService {
    private subject = new Subject<ToastMessage>();

    constructor() {
    }

    getToasts(): Observable<ToastMessage> {
        return this.subject.asObservable();
    }

    show(toast) {
        setTimeout(() => {
            this.subject.next(<ToastMessage>toast);
        }, 0);
        
    }

}

