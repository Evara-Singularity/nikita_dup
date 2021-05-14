import { DashboardService } from './../../dashboard.service';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'retail-address',
  templateUrl: 'retailAddress.html',
  styleUrls: [
    './retailAddress.scss'
  ],
})

export class RetailAddressComponent {
  addressList: Array<any>;
  showAddressList: boolean = true;
  addressHeader: string = "shipping address";
  showMenuBar: Array<boolean> = new Array(10);
  showLoader: boolean = true;
  currentAddress;
  addressFormGroup: FormGroup;
  addressFormButtonText: string = "SAVE";
  invoiceType: string;

  constructor(public _dashboardService: DashboardService) {
    this.invoiceType = "retail";
  }
}