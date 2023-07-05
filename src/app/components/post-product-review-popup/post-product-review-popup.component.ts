import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { ProductService } from '../../utils/services/product.service';

@Component({
  selector: 'app-post-product-review-popup',
  templateUrl: './post-product-review-popup.component.html',
  styleUrls: ['./post-product-review-popup.component.scss']
})
export class PostProductReviewPopupComponent implements OnInit {

  @Input() productInfo: any
  @Output() removed: EventEmitter<any> = new EventEmitter<any>();
  @Output() submitted: EventEmitter<boolean> = new EventEmitter<boolean>();
  isFormSubmitted:boolean = false;

  reviewForm: FormGroup;
  ratingValue = 0;

  constructor(
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // console.log('PostProductReviewPopupComponent productInfo', this.productInfo);
    this.createForm();
  }

  createForm(){
    this.reviewForm = this.formBuilder.group({
      review_subject: ['', [Validators.required, Validators.maxLength(100)]],
      review_text: ['', [Validators.maxLength(600),Validators.pattern(/^[A-Za-z0-9 ]+$/)]]
    });
  }

  postReview() {
    if (this.reviewForm.valid && this.ratingValue > 0) {
      const user = this.localStorageService.retrieve('user');
      // const obj = {
      //   review_type: "PRODUCT_REVIEW",
      //   item_type: "PRODUCT",
      //   item_id: this.productInfo['partNumber'],
      //   rating: this.ratingValue,
      //   review_subject: this.reviewForm.controls['review_subject'].value,
      //   review_text: this.reviewForm.controls['review_text'].value,
      //   review_id: null,
      //   user_id: user.userId,
      //   user_name: user.userName
      // };
      const obj = {
        reviewType: "PRODUCT_REVIEW",
        itemType: "PRODUCT",
        itemId: this.productInfo['partNumber'],
        rating: this.ratingValue,
        reviewSubject: this.reviewForm.controls['review_subject'].value,
        reviewText: this.reviewForm.controls['review_text'].value,
        reviewId: null,
        userId: user.userId,
        userName: user.userName
      };
     
      this.productService.postReview(obj).subscribe(
        res => {
          this.reviewForm.controls['review_subject'].setValue('');
          this.reviewForm.controls['review_text'].setValue('');
          this.ratingValue = 0;
          if (res['code'] == "200") {
            this.submitted.emit(true);
            this.isFormSubmitted = true;
          } else {
            this.submitted.emit(false);
            // console.log('review not submitted', res);
            this.isFormSubmitted = true;
          }
          this.cdr.detectChanges();
        }
      );
    }
  }

  outData(data) {
    // console.log('write review outData data', data)
    this.removed.emit(data);
  }
  get review_title() { return this.reviewForm.get("review_subject"); }
  get review_text()  { return this.reviewForm.get("review_text"); }

}

@NgModule({
  declarations: [PostProductReviewPopupComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopUpModule
  ]
})
export default class PostProductReviewPopupModule {

}
