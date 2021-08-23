import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-otp-popup',
    templateUrl: './otp-popup.component.html',
    styleUrls: ['./otp-popup.component.css']
})
export class OtpPopupComponent implements OnInit
{
    private cDistryoyed = new Subject();
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();

    constructor() { }

    ngOnInit(): void
    {
    }

    closeModal() { this.closePopup$.emit(); }

    ngOnDestroy()
    {
        this.cDistryoyed.next();
        this.cDistryoyed.unsubscribe();
    }

}
