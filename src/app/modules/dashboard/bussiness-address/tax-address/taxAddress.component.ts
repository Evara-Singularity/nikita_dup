import { DashboardService } from './../../dashboard.service';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'tax-address',
  templateUrl: 'taxAddress.html',
  styleUrls: [
    './taxAddress.scss'
  ],
})

export class TaxAddressComponent {
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
    this.invoiceType = "tax";
  }

  ngOnInit() { }
}
