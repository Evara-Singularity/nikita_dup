import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, Output } from '@angular/core';
import { PopUpVariant2Module } from '@app/modules/pop-up-variant2/pop-up-variant2.module';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'faq-success-popup',
    templateUrl: './faq-success-popup.component.html',
    styleUrls: ['./faq-success-popup.component.scss']
})
export class FaqSuccessPopoupComponent {
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    constructor(
        private _commonService: CommonService,
    ) { }

    closeVariant2Popup(section) {
        this._commonService.setBodyScroll(null,true);
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