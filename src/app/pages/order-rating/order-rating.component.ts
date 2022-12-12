import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { DataService } from '@app/utils/services/data.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';

@Component({
  selector: 'app-order-rating',
  templateUrl: './order-rating.component.html',
  styleUrls: ['./order-rating.component.scss']
})
export class OrderRatingComponent implements OnInit {

  readonly starObject = [{
    ratingCount: 1,
    ratingText: 'Terrible',
  },
  {
    ratingCount: 2,
    ratingText: 'Bad',
  },
  {
    ratingCount: 3,
    ratingText: 'Okay',
  },
  {
    ratingCount: 4,
    ratingText: 'Good',
  },
  {
    ratingCount: 5,
    ratingText: 'great',
  }
  ];

  productOverAllRating = new FormGroup({
    id: new FormControl(''),
    overAllExperience: new FormControl(''),
    deliveryExperience: new FormControl(''),
    productQualityExperience: new FormControl(''),
    customerCareExperience: new FormControl(''),
    Comment: new FormControl('')
  });

  disableContinue: boolean = true;
  pageNav: string = "";
  deliveryExperienceText: string = ''
  productQualityExperienceText: string = ''
  customerCareExperienceText: string = '';
  alreadySubmittedResponse: boolean = false;
  orderId: string = '';
  itemId: string = '';
  feedbackId = '';

  constructor(
    private _globalLoader: GlobalLoaderService,
    private _dataService: DataService,
    private _route: ActivatedRoute,
    private router: Router,
    private _tms: ToastMessageService

  ) { }

  get overallFeedback() {
    return this.productOverAllRating.controls['overAllExperience'].value || 0;
  }
  get deliveryFeedback() {
    return this.productOverAllRating.controls['deliveryExperience'].value || 0;
  }
  get productQualityFeedback() {
    return this.productOverAllRating.controls['productQualityExperience'].value || 0;
  }
  get customerConnectFeedback() {
    return this.productOverAllRating.controls['customerCareExperience'].value || 0;
  }
  get customercommentFeedback() {
    return this.productOverAllRating.controls['Comment'].value || "";
  }

  ngOnInit() {
    this._route.params.subscribe(params => {
      if (params.orderId && params.itemId) {
        this.orderId = params.orderId;
        this.itemId = params.itemId;
        this.initialiseFeedback(params.orderId, params.itemId);
      } else {
        this.router.navigate(['/']);
      }
    })
  }

  initialiseFeedback(orderId, itemId) {
    this._globalLoader.setLoaderState(true);
    this._dataService.registerFeedbackId(orderId, itemId).subscribe(response => {
      if (response['code'] == 200 && response['data'] != null && response['status'] == true) {
        if (response['data']['id']) {
          this.feedbackId = response['data']['id'];
        }
        if (!response['completed']) {
          this.productOverAllRating.controls.id.setValue(response['data'].id);
          if (response['data']['feedback'] != null) {
            if (response['data']['feedback']['overallFeedback'] != null) {
              this.productOverAllRating.controls.overAllExperience.setValue(response['data']['feedback']['overallFeedback']);
              this.disableContinue = false;
              this.pageNav = 'pageTwo';
            }
            if (response['data']['feedback']['deliveryFeedback'] != null) {
              this.productOverAllRating.controls.deliveryExperience.setValue(response['data']['feedback']['deliveryFeedback']);
              this.deliveryExperienceText = this.starObject[this.deliveryFeedback - 1].ratingText;
            }
            if (response['data']['feedback']['productQualityFeedback'] != null) {
              this.productOverAllRating.controls.productQualityExperience.setValue(response['data']['feedback']['productQualityFeedback']);
              this.productQualityExperienceText = this.starObject[this.productQualityFeedback - 1].ratingText;
            }
            if (response['data']['feedback']['customerConnectFeedback'] != null) {
              this.productOverAllRating.controls.customerCareExperience.setValue(response['data']['feedback']['customerConnectFeedback']);
              this.customerCareExperienceText = this.starObject[this.customerConnectFeedback - 1].ratingText;
            }
            if (response['data']['feedback']['comments']) {
              this.productOverAllRating.controls.Comment.setValue(response['data']['feedback']['comments']);
            }
          } else {
            this.pageNav = 'pageOne';
          }
        } else {
          this.alreadySubmittedResponse = true;
          this.pageNav = "pageThree";
        }

      } else {
        this._tms.show({ type: 'error', text: response['message'] + 'Invalid order Id' });
        // this.router.navigate(['/']);
      }
      this._globalLoader.setLoaderState(false)
    })

  }

  chooseStar(controlName, value) {
    this.disableContinue = false;
    this.productOverAllRating.controls[controlName].setValue(value); this.ratingFeedback(false);
    switch (controlName) {
      case "deliveryExperience":
        this.deliveryExperienceText = this.starObject[value - 1].ratingText;
        break;
      case "productQualityExperience":
        this.productQualityExperienceText = this.starObject[value - 1].ratingText;
        break;
      case "customerCareExperience":
        this.customerCareExperienceText = this.starObject[value - 1].ratingText;
        break;
    }
  }

  continue() {
    this.pageNav = "pageTwo";
    this.chooseStar('overAllExperience', this.overallFeedback)
  }

  onSubmit() {
    this.pageNav = "pageThree";
    this.ratingFeedback(true);
  }

  ratingFeedback(completed) {

    let feedbackPostBody = {
      customerId: "",
      contactNo: "",
      orderId: this.orderId,
      itemId: this.itemId,
      feedback: {
        deliveryFeedback: this.deliveryFeedback,
        productQualityFeedback: this.productQualityFeedback,
        customerConnectFeedback: this.customerConnectFeedback,
        overallFeedback: this.overallFeedback,
        comments: this.customercommentFeedback
      },
      "completed": completed
    };
    if (this.feedbackId) {
      feedbackPostBody['id'] = this.feedbackId;
    }
    this._dataService.submtFeedbackRating(feedbackPostBody).subscribe(response => {
      if (response['code'] == 200 && response['data'] != null && response['status'] == true) {
        if (response['data']['id']) {
          this.feedbackId = response['data']['id'];
        }
      }
    });
  }
}
