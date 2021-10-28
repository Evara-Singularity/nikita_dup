import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, OnDestroy, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from '@app/modules/modal/modal.module';
import { Subject } from 'rxjs';

@Component({
    selector: 'question-answer',
    templateUrl: './question-answer.component.html',
    styleUrls: ['./question-answer.component.scss']
})
export class QuestionAnswerComponent implements OnInit, OnDestroy
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
    declarations: [QuestionAnswerComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
    ]
})
export default class QuestionAnswerModule { }
