import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ProductService } from '@app/utils/services/product.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';

@Component({
    selector: 'ask-question-popup',
    templateUrl: './ask-question-popup.component.html',
    styleUrls: ['./ask-question-popup.component.scss']
})
export class AskQuestionPopoupComponent {
    questionText = '';
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Output() showSuccessPopup$: EventEmitter<any> = new EventEmitter<any>();

    @Input('productCategoryDetails') productCategoryDetails = null;
    @Input('productSubPartNumber') productSubPartNumber = null;
    @Input('defaultPartNumber') defaultPartNumber = null;
    @Input('productUrl') productUrl = null;
    constructor(
        private router: Router,
        public localStorageService: LocalStorageService,
        private productService: ProductService,
        private _tms: ToastMessageService ) { }

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

    postQuestion() {
        if (this.localStorageService.retrieve('user').authenticated == "true") {
            if (this.questionText.length > 0) {
                const obj = {
                    categoryCode: this.productCategoryDetails["categoryCode"],
                    categoryName: this.productCategoryDetails["categoryName"],
                    customerId: this.localStorageService.retrieve("user").userId,
                    productMsn: this.productSubPartNumber || this.defaultPartNumber,
                    questionText: this.questionText,
                    taxonomy: this.productCategoryDetails["taxonomy"],
                    taxonomyCode: this.productCategoryDetails["taxonomyCode"],
                };
                this.productService.postQuestion(obj).subscribe(
                    res => {
                        if (res['code'] == "200") {
                            this.showSuccessPopup$.emit();
                            this.questionText = ''
                        } else {
                            this._tms.show({ type: 'success', text: 'Currently unable to post question' });
                        }
                    }
                );
            }
            else {
                this._tms.show({ type: 'success', text: 'Kindly enter your question' });
            }
        }
        else {
            this.goToLoginPage(this.productUrl);
        }
    }
}

@NgModule({
    declarations: [AskQuestionPopoupComponent],
    imports: [
        CommonModule,
        FormsModule,
        PopUpModule
    ],
    exports: [AskQuestionPopoupComponent]
})
export default class AskQuestionPopoupModule { }