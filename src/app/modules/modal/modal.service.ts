import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private subject = new Subject<{}>();
    private hideModalSub = new Subject<boolean>();
    
    constructor(private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector) {
    }

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
