import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopUpVariant2Module } from '@app/modules/pop-up-variant2/pop-up-variant2.module';
@Component({
    selector: 'question-answer',
    templateUrl: './question-answer.component.html',
    styleUrls: ['./question-answer.component.scss']
})
export class QuestionAnswerComponent implements OnInit, OnDestroy
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
    closeVariant2Popup()
    {
        this.closePopup$.emit();
        this.displayVariant2Popup = false
    }
}

@NgModule({
    declarations: [QuestionAnswerComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PopUpVariant2Module
    ],
    exports: [QuestionAnswerComponent]

})
export default class QuestionAnswerModule { }
