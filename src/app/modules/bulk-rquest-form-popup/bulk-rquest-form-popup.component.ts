import { CommonModule } from '@angular/common';
import { Component, ComponentFactoryResolver, EventEmitter, Injector, Input, NgModule, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ListAutocompleteModule } from '@app/components/list-autocomplete/list-autocomplete.component';
import { ProductSkeletonsModule } from '@app/components/product-skeletons/product-skeletons.component';
import { SimilarProductModule } from '@app/components/similar-products/similar-products.component';
import { ProductModule } from '@app/pages/product/product.module';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { AuthFlowType } from '@app/utils/models/auth.modals';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Step } from '@app/utils/validators/step.validate';
import { LocalStorageService } from 'ngx-webstorage';
import { PopUpModule } from '../popUp/pop-up.module';
import { SharedAuthUtilService } from '../shared-auth-v1/shared-auth-util.service';
import { SharedAuthModule } from '../shared-auth-v1/shared-auth.module';
import { SharedAuthService } from '../shared-auth-v1/shared-auth.service';
import { ToastMessageService } from '../toastMessage/toast-message.service';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { CartService } from '@app/utils/services/cart.service';

@Component({
  selector: "bulk-rquest-form-popup",
  templateUrl: "./bulk-rquest-form-popup.component.html",
  styleUrls: ["./bulk-rquest-form-popup.component.scss"],
})
export class BulkRquestFormPopupComponent implements OnInit {


  newRfqRequest() {
    this.bulkrfqForm.get("productType").setValue('');
    this.bulkrfqForm.get("quantity").setValue('');
    this.bulkrfqForm.get("budget").setValue('');
    this.bulkrfqForm.get("phone").setValue('');
    this.bulkrfqForm.markAsPristine();
    this.bulkrfqForm.markAsUntouched();
    this.moveToNext(this.stepNameLogin);
  }

  toggle(event) {
    // alert("oggle"+JSON.stringify(event,null,2))
  }

  captureOTP(otpValue)
  {
      if (!otpValue) return;
      this._loader.setLoaderState(true);
      const REQUEST = { email: '', phone: '', source: "login_otp" };
      REQUEST['type'] = this._sharedAuthUtilService.getUserType(this._sharedAuthService.AUTH_LOGIN_FLOW, this.bulkrfqForm.get('phone').value);
      REQUEST['otp'] = otpValue;
      REQUEST.phone = this.bulkrfqForm.get('phone').value;
      this._sharedAuthService.authenticate(REQUEST).subscribe(
          (response) =>
          {
              this._loader.setLoaderState(false);
              if (response['statusCode'] !== undefined && response['statusCode'] === 500) {
                  this._tms.show({ type: "error", text: response['status'] || response['message'] });
                  this._cartService.logOutAndClearCart();
                  return;
              }
              this.processAuthenticaton(response);
          },
          (error) => { this._loader.setLoaderState(false); }
      )
      this._loader.setLoaderState(false);
  }

  readonly stepNameLogin = 'LOGIN';
  readonly stepNameOtp = 'OTP';
  readonly stepNameSignUp = 'SIGN_UP';
  readonly stepNameRfqForm = 'RFQ_FORM';
  readonly stepNameConfimation = 'CONFIRMATION';
  @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
  @Input("isCheckout") isCheckout = false;
  @Input("isLoginPopup") isLoginPopup = true;
  @Output() togglePopUp$: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeAuthComponent$: EventEmitter<any> = new EventEmitter<any>();
  similarProductInstance = null;
  @ViewChild("similarProduct", { read: ViewContainerRef })
  similarProductContainerRef: ViewContainerRef;

  stepState: "LOGIN" | "OTP" | "" | "RFQ_FORM" | "CONFIRMATION" = this.stepNameLogin;
  bulkrfqForm: FormGroup;
  gstinForm: FormGroup;
  confirmationForm: FormGroup;
  readonly PRICE_VALUES = [
    "1 qty",
    "2 - 5 qty",
    "6 - 10 qty",
    "11 - 15 qty",
    "16 - 1100 qty",
  ];
  readonly PRODUCT_TYPES = [
    "PRODUCT 1",
    "PRODUCT 2",
    "PRODUCT 3",
    "PRODUCT 4",
    "PRODUCT 5",
  ];
  otpForm: FormArray = new FormArray([]);
  authFlow: AuthFlowType; //gives flowtype & identifier information
  user: boolean = false;

  // openDropdown: boolean=false;

  constructor(
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private _commonService: CommonService,
    private _loader: GlobalLoaderService,
    private _sharedAuthService: SharedAuthService,
    private _tms: ToastMessageService,
    private _localAuthService: LocalAuthService,
    private activatedRoute: ActivatedRoute,
    private _router: Router,
    private _sharedAuthUtilService: SharedAuthUtilService,
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    private _cartService: CartService
  ) {
    this.createRfqForm();
    this.createGstinForm();
  }

  ngOnInit(): void {
    this.user=this.localStorageService.retrieve("user");
    this.authFlow = this._localAuthService.getAuthFlow();
    this._sharedAuthUtilService.updateOTPControls(this.otpForm, 6);
  }


  createGstinForm() {
    const userSession = this._localAuthService.getUserSession();
    this.gstinForm = this.formBuilder.group({
      gstin: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}"
          ),
        ],
      ],
      email: [
        userSession && userSession["email"] ? userSession["email"] : "",
        [Validators.required, Step.validateEmail],
      ],
      description: [""],
    });
  }

  createRfqForm() {
    const user = this.localStorageService.retrieve("user");
    this.bulkrfqForm = this.formBuilder.group({
      productType: ["", [Validators.required]],
      quantity: ["", [Validators.required]],
      budget: [""],
      phone: [
        user != null && user.authenticated == "true" ? user.phone : "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
    });
  }

  outData(data) {
    // alert("this.stepState"+this.stepState)
    // alert("this.user['authenticated']"+this.user['authenticated']=="true")

    if (this.stepState === this.stepNameOtp){
      this.moveToNext(this.stepNameLogin)
    }
    else if (this.stepState === this.stepNameLogin){
     this.closePopup$.emit();
  }

  else if (this.stepState === this.stepNameRfqForm){
    this.user['authenticated'] == "true" ?
    this.moveToNext(this.stepNameLogin):
    this.loginAndValidatePhone();
  }
  else if (this.stepState === this.stepNameConfimation){
    this.closePopup$.emit();
  }

    // alert(this.stepState);
    // alert(this.stepNameRfqForm);
    // // alert("data==>",data);
    // // alert("this.stepState === this.stepNameRfqForm   "+this.stepState+" :  "+this.stepNameRfqForm+"  ===>"+this.stepState == this.stepNameRfqForm);
    // if(this.stepState === 'RFQ_FORM'){
    //   this.moveToNext(this.stepNameLogin)
    //   // return;
    // }

    // else this.closePopup$.emit();
  }

  moveToNext(stepName) {
    this.stepState = stepName;
  }

  updateQuantity(arg0: AbstractControl) {}

  updateProductType(arg0: AbstractControl) {}

  processAuthenticaton(response) {
    this._sharedAuthUtilService.sendGenericPageClickTracking(true);
    const BACKURLTITLE = this._localAuthService.getBackURLTitle();
    let REDIRECT_URL = (BACKURLTITLE && BACKURLTITLE['backurl']) || this._sharedAuthService.redirectUrl;
    const queryParams = this._commonService.extractQueryParamsManually(location.search.substring(1))
    if (queryParams.hasOwnProperty('state') && queryParams.state === 'raiseRFQQuote') {
        REDIRECT_URL += '?state=' + queryParams['state'];
    }
    this._localAuthService.setUserSession(response);
    this._localAuthService.clearAuthFlow();
    this._localAuthService.clearBackURLTitle();
    this.moveToNext(this.stepNameRfqForm);
  }
  
  loginAndValidatePhone() {
    this.user['authenticated'] == "true" ?this.moveToNext(this.stepNameRfqForm):this.validateUserWithPhone();
  }
  validateUserWithPhone() {
    this._loader.setLoaderState(true);
    const body = {
      email: "",
      phone: this.bulkrfqForm.get("phone").value,
      type: "p",
    };
    this._sharedAuthService.isUserExist(body).subscribe((response) => {
      if (response["statusCode"] == 200) {
        const isUserExists = response["exists"] as boolean;
        //NOTE:using local storage//flowType, identifierType, identifier, data
        const FLOW_TYPE = isUserExists
          ? this._sharedAuthService.AUTH_LOGIN_FLOW
          : this._sharedAuthService.AUTH_SIGNUP_FLOW;
        // alert("FLOW_TYPE: " + FLOW_TYPE)
        this._localAuthService.setAuthFlow(
          isUserExists,
          FLOW_TYPE,
          this._sharedAuthService.AUTH_USING_PHONE,
          this.bulkrfqForm.get("phone").value
        );
        // if (this.isLoginPopup) {
        //   this.navigateToNextPopUp(isUserExists);
        // }
        this.moveToNext(this.stepNameOtp);

      } else {
        this._tms.show({ type: "error", text: response["message"] });
      }
      this._loader.setLoaderState(false);
    });
  }

  navigateToNextPopUp(isUserExists) {
    const LINK =  "OTP";

    if (LINK === "OTP") {
      this.moveToNext(this.stepNameOtp);
    }
  }

  removeAuthComponent() {
    this.moveToNext(this.stepNameRfqForm);
  }

  togglePopUp(value) {
  }

  // getProductApiData()
  // {
  //     // data received by product resolver
  //     this.route.data.subscribe(
  //         (rawData) =>
  //         {
  //             // console.log(rawData["product"]);
  //             if (!rawData["product"]["error"] && rawData["product"][0]["active"]==true) {
  //                 if (
  //                     rawData["product"][0]["productBO"] &&
  //                     Object.values(
  //                         rawData["product"][0]["productBO"]["productPartDetails"]
  //                     )[0]["images"] !== null
  //                 ) {
  //                     this.commonService.enableNudge = false;
  //                     this.processProductData(
  //                         {
  //                             productBO: rawData["product"][0]["productBO"],
  //                             refreshCrousel: true,
  //                             subGroupMsnId: null,
  //                         },
  //                         rawData["product"][0]
  //                     );
  //                     this.getSecondaryApiData(rawData["product"][1], rawData["product"][2], rawData["product"][3], rawData["product"][4], rawData["product"][5], rawData["product"][6]);
  //                 } else {
  //                     this.showLoader = false;
  //                     this.globalLoader.setLoaderState(false);
  //                     this.productNotFound = true;
  //                     this.pageTitle.setTitle("Page Not Found");
  //                     if (this.isServer && this.productNotFound) {
  //                         this._response.status(404);
  //                     }
  //                 }
  //             } else {
  //                 this.productNotFound = true;
  //                 this.pageTitle.setTitle("Page Not Found");
  //                 if (this.isServer && this.productNotFound) {
  //                     this._response.status(404);
  //                 }
  //             }
  //             this.showLoader = false;
  //             this.globalLoader.setLoaderState(false);
  //             this.checkForRfqGetQuote();
  //             this.checkForAskQuestion();
  //             this.updateUserSession();
  //         },
  //         (error) =>
  //         {
  //             this.showLoader = false;
  //             this.globalLoader.setLoaderState(false);
  //         }
  //     );
  // }

  async onVisibleSimilar(htmlElement)
  {
      if (!this.similarProductInstance) {
          const { SimilarProductsComponent } = await import(
              "./../../components/similar-products/similar-products.component"
          );
          const factory = this.cfr.resolveComponentFactory(
              SimilarProductsComponent
          );
          this.similarProductInstance =
              this.similarProductContainerRef.createComponent(
                  factory,
                  null,
                  this.injector
              );

          this.similarProductInstance.instance["partNumber"] = 'MSN39YR74XXL5Q';
          this.similarProductInstance.instance["groupId"] = '';
          this.similarProductInstance.instance["productName"] = 'Melbon 40 inch Black Full HD Smart Android LED TV with 18 Months Warranty';
          this.similarProductInstance.instance["categoryCode"] =
              '250131100';

          this.similarProductInstance.instance["outOfStock"] =
              'false';
          (
              this.similarProductInstance.instance[
              "similarDataLoaded$"
              ] as EventEmitter<any>
          ).subscribe((data) =>
          {
              this._commonService.triggerAttachHotKeysScrollEvent('similar-products');
          });
      //     const custData = this._commonService.custDataTracking;
      //     const orderData = this.orderTracking;
      //     const TAXONS = this.taxons;
      //     const page = {
      //         pageName: null,
      //         channel: "pdp",
      //         subSection: "Similar Products",
      //         linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
      //         linkName: null,
      //         loginStatus: this.commonService.loginStatusTracking,
      //     };
      //     this.similarProductInstance.instance["analytics"] = {
      //         page: page,
      //         custData: custData,
      //         order: orderData,
      //     };
      // }
      // this.holdRFQForm = false;
        }
  }
}

@NgModule({
    declarations: [BulkRquestFormPopupComponent],
    exports: [
        BulkRquestFormPopupComponent
    ],
    imports: [
        CommonModule,
        PopUpModule,
        SharedAuthModule,
        ReactiveFormsModule,
        ListAutocompleteModule,
        NumberDirectiveModule,
        SimilarProductModule,
        ProductSkeletonsModule,
        ObserveVisibilityDirectiveModule,
      ]
})
export class BulkRquestFormPopupModule { }
