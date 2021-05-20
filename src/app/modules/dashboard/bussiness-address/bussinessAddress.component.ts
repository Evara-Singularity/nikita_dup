import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { LocalAuthService } from '@app/utils/services/auth.service';
declare var digitalData: {};
declare let _satellite;

@Component({
  selector: 'bussiness-address',
  templateUrl: 'businessAddress.html',
  styleUrls: [
    './businessAddress.scss'
  ],
})

export class BussinessAddressComponent {
  addressList: Array<any>;
  showAddressList: boolean = true;
  addressHeader: string = "shipping address";
  showMenuBar: Array<boolean> = new Array(10);
  showLoader: boolean = true;
  currentAddress;
  addressFormGroup: FormGroup;
  addressFormButtonText: string = "SAVE ADDRESS";
  invoiceType: string;
  activeInvoiceType = 'Retail';
  eventNavigationStart: any;
  isServer: boolean;
  isBrowser: boolean;

  constructor(private _localAuthService: LocalAuthService, private meta: Meta, @Inject(PLATFORM_ID) platformId, private _router: Router) {
    this.invoiceType = "retail";
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {

    this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });
    this.setInvoiceType((this._router.url == '/dashboard/address' || this._router.url == '/dashboard/address/retail') ? 'retail' : 'tax');
    this.eventNavigationStart = this._router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.setInvoiceType(this._router.url == '/dashboard/address/retail' ? 'retail' : 'tax');
    })
    let userSession = this._localAuthService.getUserSession();

    let pageData = {
      'pageName': "”moglix:account dashboard-business address",
      'channel': "moglix:my account",
      'subSection': "moglix:account dashboard-business address",
      'loginStatus': (userSession && userSession.authenticated && userSession.authenticated == "true") ? "registered user" : "guest"
    }
    let custData = {
      'customerID': (userSession && userSession["userId"]) ? btoa(userSession["userId"]) : '',
      'emailID': (userSession && userSession["email"]) ? btoa(userSession["email"]) : '',
      'mobile': (userSession && userSession["phone"]) ? btoa(userSession["phone"]) : '',
      'customerType': (userSession && userSession["userType"]) ? userSession["userType"] : '',
    }
    let order = {}
    digitalData["page"] = pageData;
    digitalData["custData"] = custData;
    digitalData["order"] = order;
    _satellite.track("genericPageLoad");
  }

  goto(type, event) {
    event.stopPropagation();
    if (type == 'tax')
      this._router.navigate(['dashboard/address/tax']);
    else
      this._router.navigate(['dashboard/address/retail']);
  }

  ngOnDestroy(): void {
    this.eventNavigationStart.unsubscribe();
  }

  setInvoiceType(invoiceType) {
    this.invoiceType = invoiceType;
  }
}