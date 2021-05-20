import { Step } from '../../utils/validators/step.validate';
import { Component, PLATFORM_ID, Inject, NgModule } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BulkEnquiryService } from '../../pages/bulkEnquiry/bulkEnquiry.service';
import { LocalStorageService } from 'ngx-webstorage';
import { isPlatformServer, isPlatformBrowser, DOCUMENT, CommonModule } from '@angular/common';
import { ClientUtility } from "../../utils/client.utility";
import { Meta } from '@angular/platform-browser';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import CONSTANTS from '@app/config/constants';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';

@Component({
  selector: 'create-enquiry-component',
  templateUrl: './createEnquiry.component.html',
  styleUrls: ['createEnquiry.component.scss']
})
export class CreateEnquiryComponent {

  isServer: boolean;
  isBrowser: boolean;
  API: {};
  isChecked: boolean;
  tabOpen = 'productDetail';
  itemsSave: Array<any> = [];

  public formdata: FormGroup;
  public bulkEnquiryForm: FormGroup;
  public isQuerySuccessfull: boolean = false;
  public image: File;
  public rfqlimit: boolean;
  public customerId: number;
  public buyerList: Array<any> = [{ "buyerId": 1, "buyerType": "Manufacturer", "description": null }, { "buyerId": 2, "buyerType": "Retailer", "description": null }, { "buyerId": 3, "buyerType": "Reseller", "description": null }, { "buyerId": 4, "buyerType": "Corporate", "description": null }, { "buyerId": 5, "buyerType": "Individual", "description": null }];
  showThanksPopup = false;

  constructor(
    private meta: Meta,
    @Inject(PLATFORM_ID) platformId,
    @Inject(DOCUMENT) private _document,
    public activatedRoute: ActivatedRoute,
    public formBuilder: FormBuilder,
    public bulkEnquiryService: BulkEnquiryService,
    public localStorageService: LocalStorageService,
    private globalAnalyticService: GlobalAnalyticsService) {

    this.isChecked = false;
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.API = CONSTANTS;
  }

  checkCustomer() {
    this.isChecked = !this.isChecked;
    this.bulkEnquiryForm.patchValue({
      buyertype: ""
    });
    return this.isChecked;
  }

  ngOnInit() {
    this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });
    this.bulkEnquiryForm = this.formBuilder.group({
      products: this.formBuilder.array([
        this.addProductForm()
      ]),
      firstname: ['', [Validators.required]],
      email: ['', [Validators.required, Step.validateEmail]],
      phoneno: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      description: ['', []],
      tin: [null, [Validators.pattern('[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}')]],
      panno: [null, []],
      company_name: [''],
      brandName: [''],
      usertype: [this.isChecked, [Validators.required]],
      buyertype: ["", []],
    });

    this.getuserData();
    this.getBusinessDetail();

    const user = this.localStorageService.retrieve('user');
    let page = {
      'pageName': "moglix:bulk query form",
      'channel': "”bulk query form",
      'subSection': "moglix:bulk query form",
      'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
    }
    let custData = {
      'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
      'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
      'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
      'customerType': (user && user["userType"]) ? user["userType"] : '',
    }
    let order = {}
    let adobeObj = {}
    adobeObj["page"] = page;
    adobeObj["custData"] = custData;
    adobeObj["order"] = order;
    this.globalAnalyticService.sendAdobeCall(adobeObj);

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
          this.bulkEnquiryForm.controls['tin'].setValue(res['data']['gstin']);
          this.bulkEnquiryForm.controls['buyertype'].setValue(res['data']['industry']);
          this.bulkEnquiryForm.controls['panno'].setValue(res['data']['pan']);
        }
      })
    }
  }

  changeOosUserType() {
    this.isChecked = !this.isChecked;
    this.bulkEnquiryForm.patchValue({

      buyertype: "",
      usertype: this.isChecked
    });
    return this.isChecked;
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

  addProductForm() {
    return this.formBuilder.group(
      {
        productName: ['', [Validators.required]],
        quantity: [null, [Validators.required, Validators.maxLength(3)]],
        brand: ['', [Validators.required]]
      }
    )
  }

  addProduct() {
    let control = <FormArray>this.bulkEnquiryForm.controls['products'];
    this.rfqlimit = false;
    if (this.bulkEnquiryForm.controls['products'].valid) {
      if (this.bulkEnquiryForm.controls['products']["controls"].length < 5)
        control.push(this.addProductForm());
      else
        this.rfqlimit = true;
    }
  }

  removeProduct(i) {
    let control = <FormArray>this.bulkEnquiryForm.controls['products'];
    control.removeAt(i)
    if (this.bulkEnquiryForm.controls['products']["controls"].length < 5) {
      this.rfqlimit = false;
    }
  }

  checkQuantityCode(event) {
    return event.charCode >= 48 && event.charCode <= 57;
  }

  sendBulkEnquiry() {

    let obj = {
      "rfqEnquiryCustomer": {
        "firstName": this.bulkEnquiryForm.controls['firstname'].value,
        "email": this.bulkEnquiryForm.controls['email'].value,
        "mobile": this.bulkEnquiryForm.controls['phoneno'].value,
        "businessUser": true,
        "company": this.bulkEnquiryForm.controls['company_name'].value,
        "buyerId": this.bulkEnquiryForm.controls['buyertype'].value,
        "tin": this.bulkEnquiryForm.controls['tin'].value,
        "description": this.bulkEnquiryForm.controls['description'].value,
        "device": "mobile"
      },
      "rfqEnquiryItemsList": this.bulkEnquiryForm.controls['products'].value
    }

    this.bulkEnquiryService.postBulkEnquiry(obj).subscribe(
      res => {
        if (res['statusCode'] == 200) {

          this.isQuerySuccessfull = true;
          this.isChecked = false;
          ClientUtility.scrollToTop(1000);
          this.showThanksPopup = true;
          this.bulkEnquiryForm.reset();
          
          setTimeout(() => {
            this.closeAlert()
          }, 5000)

          
          // analytics
          const analyticObj = {}
          analyticObj['page']['linkPageName'] = "moglix:bulk query form",
          analyticObj['page']['linkName'] = 'Submit RFQ',
          analyticObj['page']['pageName'] = '',
          analyticObj['page']['channel'] = '',
          analyticObj['page']['subSection'] = '',
          analyticObj['page']['loginStatus'] = ''

          this.globalAnalyticService.sendGTMCall({
            'event': 'rfq_boqp'
          })
          this.globalAnalyticService.sendAdobeCall(analyticObj,'genericClick')

        }
      }
    );
  }

  closeAlert() {
    this.showThanksPopup = false;
  }

}

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
