import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PopupService {
    showPayUOffer: boolean = false;
    public payUOfferPopUpSubject: Subject<boolean> = new Subject<boolean>();
    public payUOfferPopUpDataSubject: Subject<any> = new Subject<any>();

    setShowPayUOffer(value) {
        this.showPayUOffer = value;
    }

    payUOfferPopUp$ = this.payUOfferPopUpSubject.asObservable();

    showPayUOfferPopUp(value) {
        this.payUOfferPopUpSubject.next(value);
    }

    setPayUOfferPopUpData(data: any) {
        this.payUOfferPopUpDataSubject.next(data);
    }


    payUOfferPopUpData$ = this.payUOfferPopUpDataSubject.asObservable();
}