import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
    selector: 'faq-list-popup',
    templateUrl: './faq-list-popup.component.html',
    styleUrls: ['./../../pages/product/product.component.scss', './../../scss/faq-popup.scss']
})
export class FaqListPopoupComponent {
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Output() emitAskQuestinPopup$: EventEmitter<any> = new EventEmitter<any>();
    @Input('questionAnswerList') questionAnswerList = null;

    constructor(
        private router: Router,
        public localStorageService: LocalStorageService) { }

    toggleAskQuestionPopup() {
        this.closePopup$.emit();
        this.emitAskQuestinPopup$.emit();
    }

    closeVariant2Popup() {
        this.closePopup$.emit();
    }

    goToLoginPage(link) {
        this.closeVariant2Popup();
        let navigationExtras: NavigationExtras = {
            queryParams: { 'backurl': link },
        };
        this.router.navigate(['/login'], navigationExtras);
    }
}

@NgModule({
    declarations: [FaqListPopoupComponent],
    imports: [
        CommonModule,
        PopUpModule,
    ],
    exports: [FaqListPopoupComponent]
})
export default class FaqListPopoupModule { }