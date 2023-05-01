import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '../../utils/services/common.service';

@Component({
  selector: 'app-product-review',
  templateUrl: './product-review.component.html',
  styleUrls: ['./product-review.component.scss']
})
export class ProductReviewComponent {
  productStaticData = this._commonService.defaultLocaleValue;
  @Input('productName') productName;
  @Input('reviewLength') reviewLength;
  @Input('overallRating') overallRating;
  @Input('rawReviewsData') rawReviewsData;
  @Output('postHelpful') postHelpful = new EventEmitter();
  @Output('writeReview') writeReview = new EventEmitter();
  @Output('reviewRatingPopup') reviewRatingPopup = new EventEmitter();
  constructor(private _commonService:CommonService,private _activatedRoute:ActivatedRoute){

  }
  ngOnInit(){
    this.getStaticSubjectData();
  }
  ngAfterViewInit() {
    if (this._commonService.isBrowser) {
      this._activatedRoute.fragment.subscribe((fragment: string)=>{
        if(this._activatedRoute.snapshot.fragment == CONSTANTS.PDP_REVIEW_HASH){
          this.reviewRatingPopup.emit()
        }
      })
    }
  }
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
    });
  }
}

@NgModule({
  declarations: [
    ProductReviewComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ProductReviewComponent
  ]
})
export class ProductReviewModule { }
