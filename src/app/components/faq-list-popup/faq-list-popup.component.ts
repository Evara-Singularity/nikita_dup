import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { CommonService } from '../../utils/services/common.service';

@Component({
    selector: 'faq-list-popup',
    templateUrl: './faq-list-popup.component.html',
    styleUrls: [ './faq-list-popup.component.scss' ]
})
export class FaqListPopoupComponent {
    productStaticData = this._commonService.defaultLocaleValue;
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Output() emitAskQuestinPopup$: EventEmitter<any> = new EventEmitter<any>();
    @Input('questionAnswerList') questionAnswerList = null;

    constructor(
        private router: Router,
        public localStorageService: LocalStorageService,
        private _commonService:CommonService
        ) { }
     ngOnInIt(){
        this.getStaticSubjectData();
     }
     getStaticSubjectData(){
        this._commonService.changeStaticJson.subscribe(staticJsonData => {
          this.productStaticData = staticJsonData;
        });
    }    

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