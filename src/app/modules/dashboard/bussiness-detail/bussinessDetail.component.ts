import { Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { Component, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BusinessDetailService } from './businessDetail.service';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { SpaceValidator } from '@app/utils/validators/space';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import CONSTANTS from '@app/config/constants';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { stateList } from '@app/utils/data/state';
import { Step } from '@app/utils/validators/step.validate';
import { CartService } from '@app/utils/services/cart.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
declare var digitalData: {};
declare let _satellite;

@Component({
  selector: "bussiness-detail",
  templateUrl: "bussinessDetail.component.html",
  styleUrls: ["bussinessDetail.component.scss"],
})
export class BussinessDetailComponent implements OnDestroy {

  error: boolean = true;
  businessDetailForm: FormGroup;
  successfulMessage: boolean;
  stateList: Array<{ idState: number; idCountry: number; name: string }>;
  isPincodeBusy: boolean = false;
  isPinCodeAvailble: boolean = true;
  componentLoaded: number = 1;
  isServer: boolean;
  isBrowser: boolean;
  //10766
  verifiedGSTINDetails = null;
  isGSTINVerified = false;
  addressLineKeys = ["bno", "flno", "bnm", "st", "loc"];
  gstinSubscriber: Subscription = null;
  set showLoader(value) {
    this.loaderService.setLoaderState(value);
  } 
  businessDetail: {
    companyName: string;
    gstin: string;
    isGstInvoice: boolean;
    pan: string;
  }; 

  constructor(
    private _localAuthService: LocalAuthService,
    private meta: Meta,
    @Inject(PLATFORM_ID) platformId,
    private _cartService: CartService,
    private _localStorageService: LocalStorageService,
    private _formBuilder: FormBuilder,
    private _businessDetailService: BusinessDetailService,
    private tms: ToastMessageService,
    private loaderService:GlobalLoaderService) {

    this.successfulMessage = false;
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.showLoader = false;
  }

  ngOnInit() {
    this.meta.addTag({ name: "robots", content: CONSTANTS.META.ROBOT2 });
    this.stateList = stateList["dataList"];
    let user = this._localStorageService.retrieve("user");
    let globalConstant = CONSTANTS.GLOBAL;

    // Avoid  calling logic on server side.
    if (this.isServer) {
      return;
    }

    this.businessDetail = {
      companyName: "",
      pan: "",
      gstin: "",
      isGstInvoice:
        user.userType == globalConstant.userType.business ? false : true,
    };
    this.getBusinessDetail();
      this.businessDetailForm = this._formBuilder.group({
          companyName: ["", [Validators.required]],
          gstin: ["", [Validators.required, Validators.minLength(15)]],
          isGstInvoice: [this.businessDetail.isGstInvoice, [Validators.required]],
          email: ["", [Step.validateEmail]],
          phone: [null, [Validators.required, Step.validatePhone]],
          postCode: [
              null,
              [
                  Validators.required,
                  Validators.minLength(6),
                  SpaceValidator.validateSpace,
                  Step.validatePostCode,
              ],
          ],
          address: this._formBuilder.group({
              idAddress: [null],
              addressCustomerName: [null],
              postCode: [null],
              landmark: [null],
              addressLine: [
                  null,
                  [Validators.required, Validators.pattern(/^[a-zA-Z0-9._;, \/()-]*$/)],
              ],
              city: [
                  null,
                  [
                      Validators.required,
                      Validators.pattern("^([a-zA-Z0-9_]*[ \t\r\n\f]*[-,/.()]*)+"),
                  ],
              ],
              idCountry: [110],
              idState: [null, [Validators.required]],
              gstin: [null],
              idCustomer: [null],
              idAddressType: [2],
              active: [true],
              invoiceType: [null],
          }),
      });
    let userSession = this._localAuthService.getUserSession();

    let pageData = {
      pageName: "”moglix:account dashboard-business detail",
      channel: "moglix:my account",
      subSection: "moglix:account dashboard-business detail",
      loginStatus:
        userSession &&
        userSession.authenticated &&
        userSession.authenticated == "true"
          ? "registered user"
          : "guest",
    };
    let custData = {
      customerID:
        userSession && userSession["userId"] ? btoa(userSession["userId"]) : "",
      emailID:
        userSession && userSession["email"] ? btoa(userSession["email"]) : "",
      mobile:
        userSession && userSession["phone"] ? btoa(userSession["phone"]) : "",
      customerType:
        userSession && userSession["userType"] ? userSession["userType"] : "",
    };
    let order = {};
    digitalData["page"] = pageData;
    digitalData["custData"] = custData;
    digitalData["order"] = order;
    if(_satellite){
      _satellite.track("genericPageLoad");
    }
  }

  ngAfterViewInit() {
    this.businessDetailForm.controls["postCode"].valueChanges.subscribe(
      (data) => {
        if (data && data.length == 6) {
          this.getCityByPincode();
        }
      }
    );
  }

  getBusinessDetail() {
    let user = this._localStorageService.retrieve("user");
    let data = { customerId: user.userId, userType: "business" };
    this._businessDetailService.getBusinessDetail(data).subscribe((res) => {
      let data = res["data"];
      if (data) {
        this.isGSTINVerified = data["gstinVerified"] ? true : false;
        this.businessDetailForm.controls["companyName"].setValue(
          data["companyName"]
        );
        this.businessDetailForm.controls["email"].setValue(data["email"]);
        this.businessDetailForm.controls["phone"].setValue(data["phone"]);
        this.businessDetailForm.controls["gstin"].setValue(data["gstin"]);
        this.businessDetailForm.controls["isGstInvoice"].setValue(
          data["isGstInvoice"]
        );
        this.businessDetailForm.controls["postCode"].setValue(data["postCode"]);
        if (data["companyName"]) {
          this.companyName.markAsDirty();
        }
        if (data["address"]) {
          this.businessDetailForm.controls["address"]["controls"][
            "idAddress"
          ].setValue(data["address"]["idAddress"]);
          this.businessDetailForm.controls["address"]["controls"][
            "addressCustomerName"
          ].setValue(data["address"]["addressCustomerName"]);
          this.businessDetailForm.controls["address"]["controls"][
            "postCode"
          ].setValue(data["address"]["postCode"]);
          this.businessDetailForm.controls["address"]["controls"][
            "landmark"
          ].setValue(data["address"]["landmark"]);
          this.businessDetailForm.controls["address"]["controls"][
            "addressLine"
          ].setValue(data["address"]["addressLine"]);
          this.businessDetailForm.controls["address"]["controls"][
            "city"
          ].setValue(data["address"]["city"]);
          this.businessDetailForm.controls["address"]["controls"][
            "idCountry"
          ].setValue(data["address"]["idCountry"]);
          this.businessDetailForm.controls["address"]["controls"][
            "idState"
          ].setValue(
            data["address"]["idState"] ? data["address"]["idState"] : ""
          );
          this.businessDetailForm.controls["address"]["controls"][
            "gstin"
          ].setValue(data["address"]["gstin"]);
          this.businessDetailForm.controls["address"]["controls"][
            "idCustomer"
          ].setValue(data["address"]["idCustomer"]);
          this.businessDetailForm.controls["address"]["controls"][
            "idAddressType"
          ].setValue(data["address"]["idAddressType"]);
          this.businessDetailForm.controls["address"]["controls"][
            "active"
          ].setValue(data["address"]["active"]);
          this.businessDetailForm.controls["address"]["controls"][
            "invoiceType"
          ].setValue(data["address"]["invoiceType"]);
          if (data["address"]["addressLine"]) {
            this.addressLine.markAsDirty();
          }
        }
      }
      this.addSubscribers();
      this.componentLoaded = 2;
    });
  }

  getCityByPincode() {
    setTimeout(() => {
      this.isPincodeBusy = true;
      this.isPinCodeAvailble = true;
      if (this.businessDetailForm.controls["postCode"].valid) {
        this._businessDetailService
          .getCityByPinCode(this.businessDetailForm.controls["postCode"].value)
          .subscribe((res) => {
            this.isPincodeBusy = false;
            if (res["status"]) {
              this.businessDetailForm
                .get("address")
                .get("postCode")
                .setValue(this.businessDetailForm.controls["postCode"].value);
              this.businessDetailForm.controls["address"]["controls"][
                "city"
              ].setValue(res["dataList"][0]["city"]);
              this.stateList.forEach((element) => {
                if (element.idState == parseInt(res["dataList"][0]["state"])) {
                  this.businessDetailForm.controls["address"]["controls"][
                    "idState"
                  ].setValue(element.idState);
                }
              });
            } else {
              this.isPinCodeAvailble = false;
              this.businessDetailForm.controls["address"]["controls"][
                "city"
              ].setValue(null);
              this.businessDetailForm.controls["address"]["controls"][
                "idState"
              ].setValue(null);
            }
          });
      }
    }, 500);
  }

  onSubmit(data, valid) {
    let user = this._localStorageService.retrieve("user");
    let budata = Object.assign({}, data, {
      customerId: user.userId,
      isGstInvoice: data.isGstInvoice ? 1 : 0,
    });
    budata["address"]["idCustomer"] = user.userId;
    budata["address"]["addressCustomerName"] = data.companyName;
    this.showLoader = true;
    this._businessDetailService.setBusinessDetail(budata).subscribe(
      (res) => {
        this.showLoader = false;
        if (res["statusCode"] === 200) {
          if (
            !this.businessDetailForm.controls["address"]["controls"][
              "idAddress"
            ].value
          )
            this.getBusinessDetail();

          user["userType"] = "business";
          this._localStorageService.store("user", user);
          this._cartService.payBusinessDetails = {
            company: data["companyName"],
            gstin: data["gstin"],
            is_gstin: data["isGstInvoice"],
          };
          this.successfulMessage = true;
          setTimeout(() => {
            this.successfulMessage = false;
          }, 5000);
          this.showBEMsgs("success", res["statusDescription"]);
        } else {
          this.showBEMsgs("error", res["statusDescription"]);
        }
      },
      (err) => {
        this.showLoader = false;
      }
    );
  }

  verifyGSTIN() {
    this.showLoader = true;
    this._businessDetailService.getGSTINDetails(this.gstin.value).subscribe(
      (response) => {
        if (
          response["statusCode"] == 200 &&
          response["taxpayerDetails"] != null
        ) {
          this.verifiedGSTINDetails = response["taxpayerDetails"];
          this.isGSTINVerified = response["valid"];
          this.postGSTINVerification();
        } else {
          this.resetGSTINVarification(response["message"]);
        }
        this.showLoader = false;
      },
      (error) => {
        this.showLoader = false;
      }
    );
  }

  postGSTINVerification() {
    let billingAddress = this.verifiedGSTINDetails["billing_address"]["addr"];
    this.postCode.setValue(billingAddress["pncd"]);
    this.companyName.markAsDirty();
    this.companyName.setValue(
      this.verifiedGSTINDetails["legal_name_of_business"]
    );
    let temp: string = "";
    this.addressLineKeys.forEach((name: string) => {
      let key = (billingAddress[name] as string).trim();
      if (key && key.length > 0) {
        temp = temp + key + ", ";
      }
    });
    this.addressLine.markAsDirty();
    this.addressLine.setValue(temp.substring(0, temp.lastIndexOf(",")));
    this.getCityByPincode();
  }

  resetGSTINVarification(message) {
    this.isGSTINVerified = false;
    this.verifiedGSTINDetails = {};
    this.showBEMsgs("error", message);
  }

  get canSave() {
    return (
      this.isPinCodeAvailble == true &&
      this.businessDetailForm.valid &&
      this.isGSTINVerified
    );
  }

  showBEMsgs(type, message) {
    this.tms.show({ type: type, text: message });
  }

  addSubscribers() {
    if (!this.gstinSubscriber) {
      this.gstinSubscriber = this.gstin.valueChanges.subscribe(
        (value: string) => {
          this.isGSTINVerified = false;
        }
      );
    }
  }

  get gstin() {
    return this.businessDetailForm.get("gstin");
  }
  get companyName() {
    return this.businessDetailForm.get("companyName");
  }
  get email() {
    return this.businessDetailForm.get("email");
  }
  get phone() {
    return this.businessDetailForm.get("phone");
  }
  get postCode() {
    return this.businessDetailForm.get("postCode");
  }
  get addressLine() {
    return this.businessDetailForm.get("address").get("addressLine");
  }
  get city() {
    return this.businessDetailForm.get("address").get("city");
  }
  get idState() {
    return this.businessDetailForm.get("address").get("idState");
  }
  get address() {
    return this.businessDetailForm.get("address");
  }
  get isGstInvoice() {
    return this.businessDetailForm.get("isGstInvoice");
  }

  ngOnDestroy() {
    if (this.gstinSubscriber) {
      this.gstinSubscriber.unsubscribe();
    }
  }
}