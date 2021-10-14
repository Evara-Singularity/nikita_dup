import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutLoginService {

  private identifierResetSubject: Subject<boolean> = new Subject<boolean>();
  private signUpSubject: Subject<boolean> = new Subject<boolean>();
  private passwordResetSubject: Subject<any> = new Subject<any>();
  private LoginUsingOTPSubject: Subject<any> = new Subject<any>();
  private resetTabSateSub: Subject<any> = new Subject<any>();
  private isAtFirstSectionObj: boolean = true;

  resetIdentifierInCheckout(status: boolean) {
    this.identifierResetSubject.next(status);
  }

  enableResetTabSateSub(value: boolean) {
    this.resetTabSateSub.next(value);
  }

  getResetTabSate(): Observable<boolean> {
    return this.resetTabSateSub.asObservable();
  }

  resetIdentifier(): Observable<boolean> {
    return this.identifierResetSubject.asObservable();
  }

  signUpCheckout(status: boolean) {
    this.signUpSubject.next(status);
  }

  isSignUpCompleted(): Observable<boolean> {
    return this.signUpSubject.asObservable();
  }

  isPasswordResetCompleted(): Observable<any> {
    return this.passwordResetSubject.asObservable();
  }

  setPasswordResetStatus(status: any) {
    this.passwordResetSubject.next(status);
  }

  isLoginUsingOTPCompleted(): Observable<any> {
    return this.LoginUsingOTPSubject.asObservable();
  }

  setLoginUsingOTPStatus(status: any) {
    this.LoginUsingOTPSubject.next(status);
  }

  set isAtFirstSection(value: boolean) {
    this.isAtFirstSectionObj = value;
  }

  get isAtFirstSection() {
    return this.isAtFirstSectionObj;
  }

}
