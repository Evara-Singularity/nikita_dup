import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ListAutocompleteModule } from '@app/components/list-autocomplete/list-autocomplete.component';
import { ProductSkeletonsModule } from '@app/components/product-skeletons/product-skeletons.component';
import { SimilarProductModule } from '@app/components/similar-products/similar-products.component';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { AuthFlowType } from '@app/utils/models/auth.modals';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { LocalStorageService } from 'ngx-webstorage';
import { PopUpModule } from '../popUp/pop-up.module';
import { SharedAuthUtilService } from '../shared-auth-v1/shared-auth-util.service';
import { SharedAuthModule } from '../shared-auth-v1/shared-auth.module';
import { SharedAuthService } from '../shared-auth-v1/shared-auth.service';
import { ToastMessageService } from '../toastMessage/toast-message.service';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { CartService } from '@app/utils/services/cart.service';
import { BulkRfqFormModule } from '@app/components/bulkRfq/bulkRfqForm/bulkRfqForm.module';
import { GstinFormModule } from '@app/components/bulkRfq/gstinForm/gstinForm.module';
import { ConfirmationFormModule } from '@app/components/bulkRfq/confirmationForm/confirmationForm.module';

@Component({
  selector: "bulk-rquest-form-popup",
  templateUrl: "./bulk-rquest-form-popup.component.html",
  styleUrls: ["./bulk-rquest-form-popup.component.scss"],
})
export class BulkRquestFormPopupComponent implements OnInit {
  readonly stepNameLogin = "LOGIN";
  readonly stepNameOtp = "OTP";
  readonly stepNameSignUp = "SIGN_UP";
  readonly stepNameRfqForm = "RFQ_FORM";
  readonly stepNameConfimation = "CONFIRMATION";
  @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
  @Input("isCheckout") isCheckout = false;
  @Input("isLoginPopup") isLoginPopup = true;
  @Output() togglePopUp$: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeAuthComponent$: EventEmitter<any> = new EventEmitter<any>();
  stepState: "LOGIN" | "OTP" | "" | "RFQ_FORM" | "CONFIRMATION" = this.stepNameLogin;
  bulkrfqForm: any;
  gstinForm: any;
  confirmationForm: FormGroup;
  otpForm: FormArray = new FormArray([]);
  authFlow: AuthFlowType; //gives flowtype & identifier information
  user: boolean = false;
  loginAndValidatePhone: boolean = false;
  bulkRfqFormPhoneno: any;

  constructor(
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private _commonService: CommonService,
    private _loader: GlobalLoaderService,
    private _sharedAuthService: SharedAuthService,
    private _tms: ToastMessageService,
    private _localAuthService: LocalAuthService,
    private _sharedAuthUtilService: SharedAuthUtilService,
    private _cartService: CartService
  ) { }

  ngOnInit(): void {
    this.user = this.localStorageService.retrieve("user");
    this.authFlow = this._localAuthService.getAuthFlow();
    this._sharedAuthUtilService.updateOTPControls(this.otpForm, 6);
  }

  outData(data) {
    const user = this.localStorageService.retrieve("user");
    if (this.stepState === this.stepNameOtp) {
      this.moveToNext(this.stepNameLogin);
    } else if (this.stepState === this.stepNameLogin) {
      this.closePopup$.emit();
    } else if (this.stepState === this.stepNameRfqForm) {
      user["authenticated"] == "true"
        ? this.moveToNext(this.stepNameLogin)
        : (this.loginAndValidatePhone = true);
    } else if (this.stepState === this.stepNameConfimation) {
      this.closePopup$.emit();
    }
  }

  setPhoneNo(event) {
    this.bulkRfqFormPhoneno = event;
  }

  moveToNext(stepName) {
    this.stepState = stepName;
  }

  processAuthenticaton(response) {
    this._sharedAuthUtilService.sendGenericPageClickTracking(true);
    const BACKURLTITLE = this._localAuthService.getBackURLTitle();
    let REDIRECT_URL =
      (BACKURLTITLE && BACKURLTITLE["backurl"]) ||
      this._sharedAuthService.redirectUrl;
    const queryParams = this._commonService.extractQueryParamsManually(
      location.search.substring(1)
    );
    if (
      queryParams.hasOwnProperty("state") &&
      queryParams.state === "raiseRFQQuote"
    ) {
      REDIRECT_URL += "?state=" + queryParams["state"];
    }
    this._localAuthService.setUserSession(response);
    this._localAuthService.clearAuthFlow();
    this._localAuthService.clearBackURLTitle();
    this.moveToNext(this.stepNameRfqForm);
  }

  setGstinForm(data) {
    this.gstinForm = data;
  } 

  setBulkRfqForm(data) {
    this.bulkrfqForm = data;
  }

  setHeaderData(): any {
    if (this.stepState == this.stepNameLogin) {
      return {
        headerText: "Get customise & best price",
        headerSubText: "Just in 2 simple steps",
      };
    } else if (this.stepState == this.stepNameRfqForm) {
      return {
        headerText: "Thank you for showing your interest",
        headerSubText: "Help with the below details to prioritise your query",
      };
    } else if (this.stepState == this.stepNameConfimation) {
      return {
        headerText: "Thanks, for submitting the query",
        headerSubText: "Below is your request summary",
      };
    } else return "";
  }

  captureOTP(otpValue) {
    if (!otpValue) return;
    this._loader.setLoaderState(true);
    const REQUEST = { email: "", phone: "", source: "login_otp" };
    REQUEST["type"] = this._sharedAuthUtilService.getUserType(
      this._sharedAuthService.AUTH_USING_PHONE, this.bulkRfqFormPhoneno
    );
    REQUEST["otp"] = otpValue;
    REQUEST["phone"] = this.bulkRfqFormPhoneno;
    this._sharedAuthService.authenticate(REQUEST).subscribe(
      (response) => {
        this._loader.setLoaderState(false);

        if (
          response["statusCode"] !== undefined ||
          response["statusCode"] === 500
        ) {
          this._tms.show({
            type: "error",
            text: response["status"] || response["message"],
          });
          this._cartService.logOutAndClearCart();
          return;
        }
        this.processAuthenticaton(response);
      },
      (error) => {
        this._loader.setLoaderState(false);
      }
    );
    this._loader.setLoaderState(false);
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
    BulkRfqFormModule,
    GstinFormModule,
    ConfirmationFormModule
  ]
})
export class BulkRquestFormPopupModule { }
