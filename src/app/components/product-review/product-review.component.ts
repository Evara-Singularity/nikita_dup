import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  constructor(private _commonService:CommonService, private cdr: ChangeDetectorRef){

  }
  ngOnInit(){
    this.getStaticSubjectData();
  }
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
      this.cdr.detectChanges();
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
