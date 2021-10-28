import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from '@app/modules/modal/modal.module';
import { Subject } from 'rxjs';

@Component({
    selector: 'review-rating',
    templateUrl: './review-rating.component.html',
    styleUrls: ['./review-rating.component.scss']
})
export class ReviewRatingComponent implements OnInit, OnDestroy
{
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Input('modalData') modalData = null;
    private cDistryoyed = new Subject();

    constructor() { }
    ngOnInit() { }

    close()
    {
        this.closePopup$.emit();
    }

    ngOnDestroy()
    {
        this.cDistryoyed.next();
        this.cDistryoyed.unsubscribe();
    }
}

@NgModule({
    declarations: [ReviewRatingComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
    ]
})
export default class ReviewRatingModule { }
