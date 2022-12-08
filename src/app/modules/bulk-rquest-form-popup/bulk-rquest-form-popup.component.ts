import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import { PopUpModule } from '../popUp/pop-up.module';
import { SharedAuthModule } from '../shared-auth-v1/shared-auth.module';

@Component({
  selector: 'bulk-rquest-form-popup',
  templateUrl: './bulk-rquest-form-popup.component.html',
  styleUrls: ['./bulk-rquest-form-popup.component.scss']
})
export class BulkRquestFormPopupComponent implements OnInit {

  readonly stepNameLogin = 'LOGIN';
  readonly stepNameOtp = 'OTP';
  readonly stepNameRfqForm = 'RFQ_FORM';
  readonly stepNameConfimation = 'CONFIRMATION';
  @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();


  stepState: 'LOGIN' | 'OTP' | 'RFQ_FORM' | 'CONFIRMATION' = this.stepNameLogin;

  constructor() { }

  ngOnInit(): void {
  }

  outData(data){
    this.closePopup$.emit();
  }

  moveToNext(stepName){
    this.stepState = stepName;
  }

}

@NgModule({
  declarations: [BulkRquestFormPopupComponent],
  imports: [
    CommonModule,
    PopUpModule,
    SharedAuthModule
  ],
  exports: [
    BulkRquestFormPopupComponent
  ]
})
export class BulkRquestFormPopupModule { }
