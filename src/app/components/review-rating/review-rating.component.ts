import { PopUpModule } from './../../modules/popUp/pop-up.module';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'review-rating',
    templateUrl: './review-rating.component.html',
    styleUrls: ['./../../pages/product/product.component.scss']
})
export class ReviewRatingComponent {
    displayVariant2Popup = true;
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Output() emitWriteReview$: EventEmitter<any> = new EventEmitter<any>();
    @Input('modalData') modalData = null;
    @Input('rawReviewsData') rawReviewsData = null;
    constructor() { }
    outData($event) {
        this.closePopup$.emit();
    }
    
    emitWriteReview() {
        this.closePopup$.emit();
        this.emitWriteReview$.emit();
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
        PopUpModule,
    ],
    exports: [ReviewRatingComponent]
})
export default class ReviewRatingModule { }
