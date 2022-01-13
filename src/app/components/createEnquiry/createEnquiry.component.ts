import { Step } from '../../utils/validators/step.validate';
import { Component, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BulkEnquiryService } from '../../pages/bulkEnquiry/bulkEnquiry.service';
import { LocalStorageService } from 'ngx-webstorage';
import { CommonModule } from '@angular/common';
import { ClientUtility } from "../../utils/client.utility";
import { Meta } from '@angular/platform-browser';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import CONSTANTS from '@app/config/constants';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'create-enquiry-component',
  templateUrl: './createEnquiry.component.html',
  styleUrls: ['createEnquiry.component.scss']
})
export class CreateEnquiryComponent {

  public bulkEnquiryForm: FormGroup;
  public customerId: number;
  showThanksPopup = false;

  constructor(
    private meta: Meta,
    public formBuilder: FormBuilder,
    public bulkEnquiryService: BulkEnquiryService,
    public localStorageService: LocalStorageService,
    private globalAnalyticService: GlobalAnalyticsService,
    public _commonService: CommonService) {
  }

  ngOnInit() {
    this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });
    this.bulkEnquiryForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Step.validateEmail]],
      phoneno: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      company_name: [''],
    });
    this.initialize();
  }

  initialize() {
    if (this._commonService.isBrowser) {
      this.getuserData();
      this.getBusinessDetail();
      this.adobeAnayticInitCall();
    }
  }

  getBusinessDetail() {
    let userSession = this.localStorageService.retrieve('user');
    if (userSession && userSession.authenticated == "true") {
      let data = { customerId: userSession.userId, userType: "business" };
      this.bulkEnquiryForm.controls['email'].setValue(userSession.email);
      this.bulkEnquiryForm.controls['phoneno'].setValue(userSession.phone);
      this.bulkEnquiryService.getCustomerBusinessDetail(data).subscribe(res => {
        if (this.bulkEnquiryForm !== undefined && res && res['data']) {
          this.bulkEnquiryForm.controls['company_name'].setValue(res['data']['companyName']);
        }
      })
    }
  }

  getuserData() {
    if (this.localStorageService.retrieve('user')) {
      let user = this.localStorageService.retrieve('user');
      if (user && user.authenticated == "true") {
        let name = user.userName.split(" ");
        this.customerId = user.userId;
        this.bulkEnquiryForm.controls['firstname'].setValue(name[0]);
        this.bulkEnquiryForm.controls['email'].setValue(user.email);
        this.bulkEnquiryForm.controls['phoneno'].setValue(user.phone);
      }
    }
  }

  sendBulkEnquiry() {
    let obj = {
      "rfqEnquiryCustomer": {
        "firstName": this.bulkEnquiryForm.controls['firstname'].value,
        "email": this.bulkEnquiryForm.controls['email'].value,
        "mobile": this.bulkEnquiryForm.controls['phoneno'].value,
        "company": this.bulkEnquiryForm.controls['company_name'].value,
      },
      "rfqEnquiryItemsList": this.bulkEnquiryForm.controls['products'].value
    }
    this.bulkEnquiryService.postBulkEnquiry(obj).subscribe(
      res => {
        if (res['statusCode'] == 200) {
          ClientUtility.scrollToTop(1000);
          this.showThanksPopup = true;
          this.bulkEnquiryForm.reset();
          this.adobeEventAfterSubmission();
        }
      }
    );
  }

  private adobeEventAfterSubmission() {
    const analyticObj: any = {
      page: {}
    };
    analyticObj['page']['linkPageName'] = "moglix:bulk query form",
      analyticObj['page']['linkName'] = 'Submit RFQ',
      analyticObj['page']['pageName'] = '',
      analyticObj['page']['channel'] = '',
      analyticObj['page']['subSection'] = '',
      analyticObj['page']['loginStatus'] = '';

    this.globalAnalyticService.sendGTMCall({
      'event': 'rfq_boqp'
    });
    this.globalAnalyticService.sendAdobeCall(analyticObj, 'genericClick');
  }

  private adobeAnayticInitCall() {
    const user = this.localStorageService.retrieve('user');
    let page = {
      'pageName': "moglix:bulk query form",
      'channel': "”bulk query form",
      'subSection': "moglix:bulk query form",
      'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
    };
    let custData = {
      'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
      'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
      'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
      'customerType': (user && user["userType"]) ? user["userType"] : '',
    };
    let order = {};
    let adobeObj = {};
    adobeObj["page"] = page;
    adobeObj["custData"] = custData;
    adobeObj["order"] = order;
    this.globalAnalyticService.sendAdobeCall(adobeObj);
  }


}

/* HTML TODO: 
  - Footer accodian not working as exected also padding are also not proper 
  */

@NgModule({
  declarations: [CreateEnquiryComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopUpModule
  ]
})
export default class CreateEnquiryModule {
}
