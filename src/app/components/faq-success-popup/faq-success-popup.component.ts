import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, Output } from '@angular/core';

@Component({
    selector: 'faq-success-popup',
    templateUrl: './faq-success-popup.component.html',
    styleUrls: ['./../../pages/product/product.component.scss']
})
export class FaqSuccessPopoupComponent {
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    constructor() { }

    closeVariant2Popup() {
        this.closePopup$.emit();
    }
}

@NgModule({
    declarations: [FaqSuccessPopoupComponent],
    imports: [
        CommonModule,
        PopUpModule
    ],
    exports: [FaqSuccessPopoupComponent]
})
export default class FaqSuccessPopoupModule { }