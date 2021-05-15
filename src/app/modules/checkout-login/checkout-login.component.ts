import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { ToastMessageService } from '../toastMessage/toast-message.service';
import { CheckoutLoginService } from '@services/checkout-login.service';
import { GlobalLoaderService } from '@services/global-loader.service';

const IDENTIFIER = {
  EMAIL: 'e',
  PHONE: 'p',
}

const SECTIONS = {
  'LOGIN': 'LOGIN',
  'FORGET_PASSWORD': 'FORGET_PASSWORD',
  'VERIFY_OTP': 'VERIFY_OTP',
  'SIGN_UP': 'SIGN_UP',
}
@Component({
  selector: 'checkout-login',
  templateUrl: './checkout-login.component.html',
  styleUrls: ['./checkout-login.component.scss']
})
export class CheckoutLoginComponent implements OnInit {

  IDENTIFIER = IDENTIFIER;
  SECTIONS = SECTIONS;

  @Output() updatedStep$: EventEmitter<any> = new EventEmitter<any>();
  @Output() socialLoginWorking$: EventEmitter<any> = new EventEmitter<any>();

  loginForm: FormGroup;
  identifierType: string;
  isIdentifierVerified: boolean; // to hold verify customer API state
  isNewUser: boolean; // After verify API to hold if user new or existing 
  currentSection: string = SECTIONS.LOGIN
  set showLoader(value) {
    this.loaderService.setLoaderState(value);
  }

  constructor(
    private checkoutLoginService: CheckoutLoginService,
    private tms: ToastMessageService,
    private localAuthService: LocalAuthService,
    private router: Router,
    private loaderService: GlobalLoaderService,
  ) { }

  ngOnInit(): void {
    this.loadSubscriber();
  }

  loadSubscriber() {
    this.checkoutLoginService.resetIdentifier().subscribe(status => {
      if (status) {
        this.moveToFirstSection();
        // this.resetForm();
      }
    });

    this.checkoutLoginService.isSignUpCompleted().subscribe(status => {
      if (status) {
        this.postSignUpProcessing();
      } else {
        this.moveToFirstSection();
        this.tms.show({ type: 'error', text: 'Registration failed. Please try again.' })
      }
    })

    this.checkoutLoginService.isPasswordResetCompleted().subscribe((result) => {
      console.log('isPasswordResetCompleted', result);
      if (result.status == true) {
        this.tms.show({ type: 'success', text: result['message'] });
      } else {
        this.tms.show({ type: 'error', text: result['message'] });
      }
      this.moveToFirstSection();
    });

    this.checkoutLoginService.isLoginUsingOTPCompleted().subscribe((result) => {
      console.log('isLoginUsingOTPCompleted', result);
      if (result.status == true) {
        this.tms.show({ type: 'success', text: result['message'] });
        this.updatedStep$.emit(2); // proceed to next checkout step;
      } else {
        // incase any erros are encountered
        this.tms.show({ type: 'error', text: result['message'] });
        // his.resetForm();
        this.moveToFirstSection();
      }
    });

    this.checkoutLoginService.getResetTabSate().subscribe((status) => {
      if (status) {
        this.moveToFirstSection();
      }
    })
  }

  moveToFirstSection() {
    this.checkoutLoginService.isAtFirstSection = true;
    this.currentSection = SECTIONS.LOGIN;
  }

  postSignUpProcessing() {
    this.localAuthService.login$.next(this.router.url);
    this.tms.show({ type: 'success', text: 'Signup successful' });
    this.updatedStep$.emit(2); // proceed to next checkout step
  }

  updatedStepEvent(event) {
    console.log('event', event);
    this.updatedStep$.emit(event);
  }

  socialLoginWorkingEvent(event) {
    this.socialLoginWorking$.emit(event);
  }

  changeTab(value) {
    console.log('changeTab', value);
    if (value == SECTIONS.LOGIN) {
      this.checkoutLoginService.isAtFirstSection = true;
    } else {
      this.checkoutLoginService.isAtFirstSection = false;
    }
    this.currentSection = value;
  }

}
