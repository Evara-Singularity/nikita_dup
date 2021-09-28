import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private subject = new Subject<{}>();
    private hideModalSub = new Subject<boolean>();
    private componentRefSubject = new BehaviorSubject(null);
    
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

    show_v1(data)
    {
        this.subject.next(data);
        return this.componentRefSubject;
    }

    getYoutubeModalRemove(): Observable<boolean> {
        return this.hideModalSub.asObservable();
    }

    remove() {
        this.hideModalSub.next(true);
    }

    removeComponentRef(){
        this.componentRefSubject.next(null);
    }

    setComponentRef(childComponentRef)
    {
        this.componentRefSubject.next(childComponentRef);
    }
}
