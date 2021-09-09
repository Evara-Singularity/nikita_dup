import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private subject = new Subject<{}>();
    private hideModalSub = new Subject<boolean>();

    getModals(): Observable<any> {
        return this.subject.asObservable();
    }

    show(data) {
        // console.log('ModalService show called');
        this.subject.next(data);
    }

    getYoutubeModalRemove(): Observable<boolean> {
        return this.hideModalSub.asObservable();
    }

    remove() {
        this.hideModalSub.next(true);
    }
}
