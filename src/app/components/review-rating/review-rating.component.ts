import { PopUpModule } from './../../modules/popUp/pop-up.module';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ProductService } from '@app/utils/services/product.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';

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
    @Input('productUrl') productUrl = null;
    @Input('oosSimilarCardNumber') oosSimilarCardNumber = -1;
    constructor(
        private router: Router,
        public localStorageService: LocalStorageService,
        private productService: ProductService,
        private _tms: ToastMessageService,
    ) { }
    outData($event) {
        this.closePopup$.emit();
    }

    emitWriteReview() {
        this.closePopup$.emit();
        this.emitWriteReview$.emit(this.oosSimilarCardNumber);
    }

    closeVariant2Popup() {
        this.closePopup$.emit();
        this.displayVariant2Popup = false
    }

    postHelpful(item, yes, no, i) {
        if (this.localStorageService.retrieve('user')) {
            let user = this.localStorageService.retrieve('user');
            if (user.authenticated == "true") {
                let obj = {
                    "review_type": "PRODUCT_REVIEW",
                    "item_type": "PRODUCT",
                    "item_id": item.item_id,
                    "review_id": item.review_id.uuid,
                    "user_id": user.userId,
                    "is_review_helpful_count_no": no,
                    "is_review_helpful_count_yes": yes
                }
                this.productService.postHelpful(obj).subscribe((res) => {
                    if (res['code'] == 200) {
                        this._tms.show({ type: 'success', text: 'Your feedback has been taken' });
                        this.rawReviewsData.reviewList[i]['isPost'] = true;
                        this.rawReviewsData.reviewList[i]['like'] = yes;
                        this.rawReviewsData.reviewList[i]['dislike'] = no;
                        this.closeVariant2Popup();
                    }
                });
            } else {
                this.goToLoginPage(this.productUrl);
            }
        } else {
            this.goToLoginPage(this.productUrl);
        }
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