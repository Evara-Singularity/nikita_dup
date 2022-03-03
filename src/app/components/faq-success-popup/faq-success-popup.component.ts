import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, Output } from '@angular/core';
import { PopUpVariant2Module } from '@app/modules/pop-up-variant2/pop-up-variant2.module';

@Component({
    selector: 'faq-success-popup',
    templateUrl: './faq-success-popup.component.html',
    styleUrls: ['./../../pages/product/product.component.scss']
})
export class FaqSuccessPopoupComponent {
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    constructor() { }

    closeVariant2Popup(section) {
        this.closePopup$.emit(section);
    }
}

@NgModule({
    declarations: [FaqSuccessPopoupComponent],
    imports: [
        CommonModule,
        PopUpVariant2Module
    ],
    exports: [FaqSuccessPopoupComponent]
})
export default class FaqSuccessPopoupModule { }