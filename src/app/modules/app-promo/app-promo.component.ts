import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-promo',
  templateUrl: './app-promo.component.html',
  styleUrls: ['./app-promo.component.scss']
})
export class AppPromoComponent implements OnInit {

  readonly assetImgPath: string = CONSTANTS.IMAGE_ASSET_URL;
  readonly key: string = 'user-app-promo-status';
  scrolledViewPort = 0;
  windowOldScroll = 0;
  showPromo: boolean = true;
  listener;
  appOpenLink=CONSTANTS.APP_OPEN_LINK;
 
 

  @Input() productData: any;
  @Input() isOverlayMode: boolean = true;
  @Input() page: string;
  @Input() showPromoCode: boolean = true;
  @Input() productMsn: string = null;
  @Input() isLazyLoaded: boolean = false;
  @Output() appPromoStatus$: EventEmitter<boolean> = new EventEmitter<boolean>();
  productStaticData = this._commonService.defaultLocaleValue;

  public appPromoStatus: boolean = true;
  public isUserAuthenticated: boolean = true;
  public isAppInstalled: boolean = false;

  constructor(
    private _localStorage: LocalStorageService,
    private _localAuthService: LocalAuthService,
    private renderer2: Renderer2,
    private _analytics: GlobalAnalyticsService,
    private _localStorageService: LocalStorageService,
    public _commonService: CommonService,

  ) {
  }

  ngOnInit(): void {
    this.getStaticSubjectData();
    this.readStatusFromLocalStorage();
    this.getUserAuthenticationStatus();
    this.getUserAuthenticationStatusChange();
  }
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this._commonService.defaultLocaleValue = staticJsonData;
      this.productStaticData = staticJsonData;
    });
  }

  ngAfterViewInit(){
    this.attachScrollHandler();
  }

  attachScrollHandler() {
    if (this._commonService.isBrowser && (this.page == 'home' || this.page == 'brand' || this.page == 'category' || this.page=='alp' || this.page=='search')) {
      this.windowOldScroll = window.pageYOffset;
      this.listener = this.renderer2.listen('window', 'scroll', (e) => {
        this.windowScrollHandler();
      });
    }
  }

  windowScrollHandler() {
    this.scrolledViewPort = window.pageYOffset;
    if(this.scrolledViewPort > this.windowOldScroll){
     this.showPromo = false;
    }
    else{
     this.showPromo = true;
    }
    this.windowOldScroll = this.scrolledViewPort;
  }


 openStore() {
  this.openLink();
}

openLink() {
  this.callAnalytics();
  window.open(this.appOpenLink, '_blank');
}


  callAnalytics() {
    const user = this._localStorageService.retrieve('user');

    let digitalData = {
      page: {
        linkName: 'Install App'
      },
      custData:this._commonService.custDataTracking
    };

    if (this.page === 'pdp') {
      let taxo1 = '';
      let taxo2 = '';
      let taxo3 = '';
      if (this.productData?.['categoryDetails'][0]['taxonomyCode']) {
        taxo1 = this.productData['categoryDetails'][0]['taxonomyCode'].split("/")[0] || '';
        taxo2 = this.productData['categoryDetails'][0]['taxonomyCode'].split("/")[1] || '';
        taxo3 = this.productData['categoryDetails'][0]['taxonomyCode'].split("/")[2] || '';
      }

      digitalData['page']['linkPageName'] = "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":pdp";
      digitalData['order'] = {
        'productID': this.productData?.['partNumber'],
        'productCategoryL1': taxo1,        
        'productCategoryL2': taxo2,        
        'productCategoryL3': taxo3,
        'brand': this.productData?.['brandDetails']['brandName']
      };


    } else {
      digitalData['page']['linkPageName'] = 'moglix: ' + this.page;
    }

    this._analytics.sendAdobeCall(digitalData, "genericClick");
  }

  removePromo() {
    this.appPromoStatus = false;
    this.appPromoStatus$.emit(false);
    this._localStorage.store(this.key, false);
  }

  readStatusFromLocalStorage() {
    if (this._localStorage.retrieve(this.key) != null) {
      this.appPromoStatus = false;
      this.appPromoStatus$.emit(false);
    } else {
      this.appPromoStatus = true;
    }
  }

  getUserAuthenticationStatus() {
    const user = this._localAuthService.getUserSession();
    this.isUserAuthenticated = user && user.authenticated && user.authenticated === 'true' ? true : false;
  }

  getUserAuthenticationStatusChange() {
    this._localAuthService.login$.subscribe((data) => {
      const user = this._localAuthService.getUserSession();
      this.isUserAuthenticated = user && user.authenticated && user.authenticated === 'true' ? true : false;
    });
  }


  get isAppPromoVisible() {
    switch (this.page) {
      case 'category':
        return this.appPromoStatus;
      case 'brand':
        return this.appPromoStatus;
      case 'alp':
        return this.appPromoStatus;
      case 'home':
        return this.appPromoStatus;
      case 'pdp':
        return true;
      default:
        return false;
    }
  }

  get homeTopBannerVisible(){
    return this.page != 'pdp'
  }

  ngOnDestroy() {
    if (this._commonService.isBrowser && this.listener) {
      this.listener();
    }
  }

}
