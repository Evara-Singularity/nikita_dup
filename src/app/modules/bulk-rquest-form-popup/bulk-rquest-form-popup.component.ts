import { Component, OnInit } from '@angular/core';

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

  stepState: 'LOGIN' | 'OTP' | 'RFQ_FORM' | 'CONFIRMATION' = this.stepNameLogin;

  constructor() { }

  ngOnInit(): void {
  }

  outData(data){
    console.log('popup', data);
  }

}
