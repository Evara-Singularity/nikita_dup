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
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { StaticCountryText } from '@app/config/static-india-text';

@Component({
  selector: 'create-enquiry-component',
  templateUrl: './createEnquiry.component.html',
  styleUrls: ['createEnquiry.component.scss']
})
export class CreateEnquiryComponent {

  public bulkEnquiryForm: FormGroup;
  public customerId: number;
  showThanksPopup = false;
  isFormSubmitted: boolean= false;
  staticCountryData = StaticCountryText;
  isFromUAE:boolean;
  mobileMaxLength = 10;

  private userDetails: { name: string, phoneno: string, email: string, company_name: string, isLogin: boolean } = {
    name: '',
    phoneno: '',
    email: '',
    company_name: '',
    isLogin: false
  }

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
      this.adobeAnayticInitCall();
    }
  }

  getuserData() {
    if (this.localStorageService.retrieve('user')) {
      let user = this.localStorageService.retrieve('user');
      if (user && user.authenticated == "true") {
        let name = user.userName.split(" ");
        this.customerId = user.userId;
        this.userDetails.isLogin = true;
        this.userDetails.name = name[0];
        this.userDetails.email = user.email;
        this.userDetails.phoneno = user.phone;
        this.getBusinessDetail();
      }
    }
  }

  getBusinessDetail() {
    let userSession = this.localStorageService.retrieve('user');
    if (userSession && userSession.authenticated == "true") {
      let data = { customerId: userSession.userId, userType: "business" };
      this.userDetails.email = userSession.email;
      this.userDetails.phoneno = userSession.phone;
      this.bulkEnquiryService.getCustomerBusinessDetail(data).subscribe(res => {
        if (this.bulkEnquiryForm !== undefined && res && res['data']) {
          this.userDetails.company_name = res['data']['companyName'];
        }
        this.setLoginUserData();
      })
    }
  }

  setLoginUserData(){
    if(this.userDetails.isLogin){
      this.nameFC.setValue(this.userDetails.name);
      this.emailFC.setValue(this.userDetails.email);
      this.phoneFC.setValue(this.userDetails.phoneno);
      this.companyFC.setValue(this.userDetails.company_name);
    }
  }

  submit(){
    this.isFormSubmitted = true;
    if(this.bulkEnquiryForm.valid){
      this.sendBulkEnquiry();
    }
  }

  sendBulkEnquiry() {
    let user = this.localStorageService.retrieve("user");
    
      let obj = {
        "rfqEnquiryCustomer": {
          "firstName": this.nameFC.value,
          "email": this.emailFC.value,
          "mobile": this.phoneFC.value,
          "company": this.companyFC.value,
        },
        "rfqEnquiryItemsList": []
    }
    this.bulkEnquiryService.postBulkEnquiry(obj).subscribe(
      res => {
        if (res['statusCode'] == 200) {
          ClientUtility.scrollToTop(1000);
          this.showThanksPopup = true;
          this.isFormSubmitted = false;
          this.bulkEnquiryForm.reset();
          this.resetFieldValues();
          this.adobeEventAfterSubmission();
        }
      }
    );
  }
  resetFieldValues(){
    this.nameFC.setValue('');
    this.emailFC.setValue('');
    this.phoneFC.setValue('');
    this.companyFC.setValue('');
  }
  
  togglePopUp(){
    this.showThanksPopup = false;
    this.bulkEnquiryForm.reset();
    this.resetFieldValues();
    this.setLoginUserData();
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
    let order = {};
    let adobeObj = {};
    adobeObj["page"] = page;
    adobeObj["custData"] = this._commonService.custDataTracking;
    adobeObj["order"] = order;
    this.globalAnalyticService.sendAdobeCall(adobeObj);
  }

  get nameFC(){
    return this.bulkEnquiryForm.get('name')
  }

  get emailFC(){
    return this.bulkEnquiryForm.get('email')
  }

  get phoneFC(){
    return this.bulkEnquiryForm.get('phoneno')
  }

  get companyFC(){
    return this.bulkEnquiryForm.get('company_name')
  }
  
  ngAfterViewInit(){
 
  }


}

/* HTML TODO: 
  - Footer accodian not working as exected also padding are also not proper 
  - Raise a new equest btn missing
  */

@NgModule({
  declarations: [CreateEnquiryComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopUpModule,
    BottomMenuModule,
    NumberDirectiveModule
  ]
})
export default class CreateEnquiryModule {
}