import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '../../utils/services/common.service';

@Component({
  selector: 'app-product-review',
  templateUrl: './product-review.component.html',
  styleUrls: ['./product-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  constructor(private _commonService:CommonService,private _activatedRoute:ActivatedRoute, private cdr: ChangeDetectorRef){

  }
  ngOnInit(){
    this.getStaticSubjectData();
  }
  
  ngAfterViewInit() {
    if (this._commonService.isBrowser) {
     setTimeout(() => {
      this.checkForFragment()
     }, 600);
    }
  }

  checkForFragment(){
    this._activatedRoute.fragment.subscribe((fragment: string)=>{
      if(this._activatedRoute.snapshot.fragment == CONSTANTS.PDP_REVIEW_HASH){
        this.reviewRatingPopup.emit()
      }
      else if(this._activatedRoute.snapshot.fragment == CONSTANTS.PDP_WRITE_REVIEW_HASH){
        this.writeReview.emit(-1)
      }
    })
  }

  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
      this.cdr.detectChanges();
    });
    this._commonService.feedBackPosted.subscribe(value => {
      if(value) {
        this.cdr.detectChanges();
      }
    })
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
