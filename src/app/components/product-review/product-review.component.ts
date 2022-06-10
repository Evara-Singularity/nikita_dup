import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-product-review',
  templateUrl: './product-review.component.html',
  styleUrls: ['./product-review.component.scss']
})
export class ProductReviewComponent {
  @Input('productName') productName;
  @Input('reviewLength') reviewLength;
  @Input('overallRating') overallRating;
  @Input('rawReviewsData') rawReviewsData;
  @Output('postHelpful') postHelpful = new EventEmitter();
  @Output('writeReview') writeReview = new EventEmitter();
  @Output('reviewRatingPopup') reviewRatingPopup = new EventEmitter();

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
