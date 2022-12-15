import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ListAutocompleteModule } from '@app/components/list-autocomplete/list-autocomplete.component';
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
// import { ProductModule } from "../../components/similar-products/similar-products.component";

@Component({
  selector: 'bulk-rquest-form-popup',
  templateUrl: './bulk-rquest-form-popup.component.html',
  styleUrls: ['./bulk-rquest-form-popup.component.scss']
})
export class BulkRquestFormPopupComponent implements OnInit,AfterViewChecked {


toggle(event) {
alert("oggle"+JSON.stringify(event,null,2))
}
captureOTP(event) {
  this.moveToNext(this.stepNameRfqForm);
}

  readonly stepNameLogin = 'LOGIN';
  readonly stepNameOtp = 'OTP';
  readonly stepNameSignUp = 'SIGN_UP';
  readonly stepNameRfqForm = 'RFQ_FORM';
  readonly stepNameConfimation = 'CONFIRMATION';
  @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
  @Input('isCheckout') isCheckout = false;
  @Input('isLoginPopup') isLoginPopup = true;
  @Output() togglePopUp$: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeAuthComponent$: EventEmitter<any> = new EventEmitter<any>();


  stepState: 'LOGIN' | 'OTP' | '' | 'RFQ_FORM' | 'CONFIRMATION' = this.stepNameLogin;
  bulkrfqForm: FormGroup;
  gstinForm: FormGroup;
  confirmationForm: FormGroup;
  readonly PRICE_VALUES = ['1 qty', '2 - 5 qty', '6 - 10 qty', '11 - 15 qty', '16 - 1100 qty'];
  readonly PRODUCT_TYPES = ['PRODUCT 1', 'PRODUCT 2', 'PRODUCT 3', 'PRODUCT 4', 'PRODUCT 5'];
  otpForm: FormArray = new FormArray([]);
  authFlow: AuthFlowType;//gives flowtype & identifier information


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
    private _sharedAuthUtilService:SharedAuthUtilService
  ) { 
    this.createRfqForm();
    this.createGstinForm();
    this.createConfirmationForm();
  }
  ngAfterViewChecked(): void {
    
  }

  ngOnInit(): void {
    this.authFlow = this._localAuthService.getAuthFlow();
    // if (!(this.authFlow)) {
    //   //  this.navigateToLogin(); 
    //    return; }
    this._sharedAuthUtilService.updateOTPControls(this.otpForm, 6);

    // this._commonService.setInitaiteLoginPopUp();
  }

  createConfirmationForm() {
    const userSession = this._localAuthService.getUserSession();
    this.confirmationForm = this.formBuilder.group({
      productName: [this.bulkrfqForm.get('productType').value, [Validators.required]],
      quantity: [this.bulkrfqForm.get('quantity').value, [Validators.required]],
      budget: [this.bulkrfqForm.get('budget').value],
      gstin: [this.gstinForm.get('gstin').value, [Validators.required, Validators.pattern('[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}')]],
      email: [(userSession && userSession['email']) ? userSession['email'] : '', [Validators.required, Step.validateEmail]],
      description: [this.gstinForm.get('description').value]
    });
  }

  createGstinForm() {
    const userSession = this._localAuthService.getUserSession();
    this.gstinForm = this.formBuilder.group({
      gstin: ['', [Validators.required, Validators.pattern('[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}')]],
      email: [(userSession && userSession['email']) ? userSession['email'] : '', [Validators.required, Step.validateEmail]],
      description: ['']
    });
  }

  createRfqForm() {
    const user = this.localStorageService.retrieve('user');

    this.bulkrfqForm = this.formBuilder.group({
      productType: ['', [Validators.required]],
      quantity: ['', [Validators.required]],
      budget: [''],
      phone: [(user != null && user.authenticated == "true") ? user.phone : "", [Validators.required, Validators.minLength(10), Validators.maxLength(10)]]
    });
  }

  outData(data) {
    this.closePopup$.emit();
  }

  moveToNext(stepName) {
    this.stepState = stepName;
  }

  updateQuantity(arg0: AbstractControl) {
  }

  updateProductType(arg0: AbstractControl) {
  }

  validateUserWithPhone() {
    // alert("In validateUserWithPhone")
    this._loader.setLoaderState(true);
    const body = { email: '', phone: this.bulkrfqForm.get('phone').value, type: 'p' };
    this._sharedAuthService.isUserExist(body).subscribe(response => {
      if (response['statusCode'] == 200) {

        const isUserExists = response['exists'] as boolean;
        //NOTE:using local storage//flowType, identifierType, identifier, data
        const FLOW_TYPE = (isUserExists) ? this._sharedAuthService.AUTH_LOGIN_FLOW : this._sharedAuthService.AUTH_SIGNUP_FLOW;
        // alert("FLOW_TYPE: " + FLOW_TYPE)
        this._localAuthService.setAuthFlow(isUserExists, FLOW_TYPE, this._sharedAuthService.AUTH_USING_PHONE, this.bulkrfqForm.get('phone').value);
        if (this.isLoginPopup) {
          // alert("97")
          // navigate to next popup screen
          this.navigateToNextPopUp(isUserExists);
        }
      } else {
        this._tms.show({ type: 'error', text: response['message'] });
      }
      this._loader.setLoaderState(false);
    })
  }

  navigateToNextPopUp(isUserExists) {
    // alert("109")
    const LINK = (isUserExists) ? 'otp' : 'sign-up';
    // this.togglePopUp$.emit(LINK);
    if (LINK === 'otp') {
      // alert("113")
      this.moveToNext(this.stepNameOtp)
    }
    if (LINK === 'sign-up') {
      // alert("117")
      this.moveToNext(this.stepNameSignUp)
    }


  }

  removeAuthComponent() {
    //needs emission
    // this.removeAuthComponent$.emit();
    alert("127")
    this.moveToNext(this.stepNameRfqForm)

  }

  togglePopUp(value) {
    // alert("133")
    // const user = this.localStorageService.retrieve('user');

    // if (user.authenticated == "true")
    //   this.moveToNext(this.stepNameRfqForm)


    // needs emission
    // this.flow = value;
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
        SimilarProductModule    ]
})
export class BulkRquestFormPopupModule { }
