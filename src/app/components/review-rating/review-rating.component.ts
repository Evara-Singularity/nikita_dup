import { PopUpModule } from './../../modules/popUp/pop-up.module';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ProductService } from '@app/utils/services/product.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CommonService } from '../../utils/services/common.service';

@Component({
    selector: 'review-rating',
    templateUrl: './review-rating.component.html',
    styleUrls: ['./review-rating.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewRatingComponent {
    productStaticData = this._commonService.defaultLocaleValue;
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
        private _commonService:CommonService,
        private cdr: ChangeDetectorRef
    ) { }
    ngOnInit(){
        this.getStaticSubjectData();
    }
    outData($event) {
        this.closePopup$.emit();
    }
    enableScroll(){
        this._commonService.setBodyScroll(null, true);
    }

    getStaticSubjectData(){
        this._commonService.changeStaticJson.subscribe(staticJsonData => {
          this._commonService.defaultLocaleValue = staticJsonData;
          this.productStaticData = staticJsonData;
        });
      }

    emitWriteReview() {
        this.closePopup$.emit();
        this.emitWriteReview$.emit(this.oosSimilarCardNumber);
    }

    closeVariant2Popup() {
        this.closePopup$.emit();
        this.displayVariant2Popup = false;
        this.enableScroll();
    }
    sortedReviewsByDate(reviewList)
    {
        return reviewList.sort((a, b) =>
        {
            let objectDateA = new Date(a.updatedAt).getTime();
            let objectDateB = new Date(b.updatedAt).getTime();
            
            return objectDateB - objectDateA;
        });
    }

    postHelpful(item,i,reviewValue) {
        if (this.localStorageService.retrieve('user')) {
            let user = this.localStorageService.retrieve('user');
            if (user.authenticated == "true") {
                // let obj = {
                //     "review_type": "PRODUCT_REVIEW",
                //     "item_type": "PRODUCT",
                //     "item_id": item.item_id,
                //     "review_id": item.review_id.uuid,
                //     "user_id": user.userId,
                //     "is_review_helpful_count_no": no,
                //     "is_review_helpful_count_yes": yes
                // }
                let obj = {
                    "id":item.id,
                    "reviewType": "PRODUCT_REVIEW",
                    "itemType": "PRODUCT",
                    "msn": item.itemId,
                    "reviewId": item.reviewId,
                    "userId": user.userId,
                    "isReviewHelpfulCountNo": (reviewValue == 'no'?1:0),
                    "isReviewHelpfulCountYes": (reviewValue == 'yes'?1:0)
                }
                this.productService.postHelpful(obj).subscribe((res) => {
                    // console.log("res",res);
                    if (res['code'] == 200) {
                        this._tms.show({ type: 'success', text: 'Your feedback has been taken' });
                        let reviewObj = {
                            reviewType: "PRODUCT_REVIEW",
                            itemType: "PRODUCT",
                            itemId: item.itemId,
                            userId: ""
                          }
                        this.productService.getReviewsRating(reviewObj).subscribe((newRes)=>{
                            if(newRes["code"] === 200){
                                this.sortedReviewsByDate(newRes['data']['reviewList']);
                                const filteredObj = newRes['data']['reviewList'].find(each => each.id == this.rawReviewsData.reviewList[i].id);
                                this.rawReviewsData.reviewList[i]["yes"] = filteredObj["isReviewHelpfulCountYes"];
                                this.rawReviewsData.reviewList[i]['like'] = reviewValue == 'yes' ? 1 : 0;
                                this.rawReviewsData.reviewList[i]['dislike'] = reviewValue == 'no' ? 1 : 0;
                                this.rawReviewsData.reviewList[i]["no"] = filteredObj["isReviewHelpfulCountNo"];
                                this.rawReviewsData.reviewList[i] = JSON.parse(JSON.stringify(this.rawReviewsData.reviewList[i]));
                                this.cdr.detectChanges();
                            }
                     });
                        // this.rawReviewsData.reviewList[i]['isPost'] = true;
                        // this.rawReviewsData.reviewList[i]['like'] = yes;
                        // this.rawReviewsData.reviewList[i]['dislike'] = no;
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