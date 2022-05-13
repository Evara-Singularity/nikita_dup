import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private subject = new Subject<{}>();
    private hideModalSub = new Subject<boolean>();
    private componentRefSubject = new BehaviorSubject(null);

    getModals(): Observable<any> {
        return this.subject.asObservable();
    }

    show(data) {
        this.subject.next(data);
    }

    show_v1(data) {
        this.subject.next(data);
        return this.componentRefSubject;
    }

    getYoutubeModalRemove(): Observable<boolean> {
        return this.hideModalSub.asObservable();
    }

    remove() {
        this.hideModalSub.next(true);
    }

    removeComponentRef() {
        this.componentRefSubject.next(null);
    }

    setComponentRef(childComponentRef) {
        this.componentRefSubject.next(childComponentRef);
    }
}
