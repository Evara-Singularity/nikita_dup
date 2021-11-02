import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopUpVariant2Module } from '@app/modules/pop-up-variant2/pop-up-variant2.module';

@Component({
    selector: 'review-rating',
    templateUrl: './review-rating.component.html',
    styleUrls: ['./review-rating.component.scss']
})
export class ReviewRatingComponent implements OnInit, OnDestroy
{
    displayVariant2Popup = true;
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Input('modalData') modalData = null;
    constructor() { }
    ngOnInit() { }
    ngOnDestroy() { }
    outData($event)
    {
        console.log($event);
        this.closePopup$.emit();
    }
    closeVariant2Popup() { 
        this.closePopup$.emit();
        this.displayVariant2Popup = false
    }
}

@NgModule({
    declarations: [ReviewRatingComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PopUpVariant2Module,//added
    ],
    exports: [ReviewRatingComponent]
})
export default class ReviewRatingModule { }
