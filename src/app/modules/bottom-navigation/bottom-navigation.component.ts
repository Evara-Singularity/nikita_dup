import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { LocalAuthService } from '@utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { LocalStorageService } from 'ngx-webstorage';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { CartService } from '@app/utils/services/cart.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'bottom-navigation',
  templateUrl: './bottom-navigation.component.html',
  styleUrls: ['./bottom-navigation.component.scss']
})
export class BottomNavigationComponent implements OnInit {

  menuSelected:boolean=true
  isUserLogin: any;
  initialNameLetter:any;
  noOfCart: number = 0;
  loginSubscriber: Subscription = null;


  constructor(
    private router: Router,
    private localAuthService: LocalAuthService,
    public _commonService: CommonService,
    private localStorageService: LocalStorageService,
    private analytics: GlobalAnalyticsService,
    private cartService: CartService,
    ) { }

  ngOnInit() {
    if (this._commonService.isBrowser) {
      this.isUserLogin = this.localAuthService.isUserLoggedIn();
      this.getFirstletterofUser();
    }
    this.cartService.getCartUpdatesChanges().subscribe((data) => {
      this.noOfCart = this.cartService.getCartItemsCount();
    });
    this.addSubscribers();
  }
  
  addSubscribers() {
    this.loginSubscriber = this.localAuthService.login$.subscribe((value) => {
    this.updateUserState();
    })
  }
  updateUserState() {
    const user = this.localAuthService.getUserSession();
    if (user && user['authenticated'] == 'true') {
      this.isUserLogin = true;
      this.getFirstletterofUser();
    }
  }

  ngOnDestroy() {
    if (this.loginSubscriber) {
        this.loginSubscriber.unsubscribe();
    }
  }  

  getFirstletterofUser() {
    let user = this.localStorageService.retrieve("user");
      if (user && user.authenticated == "true") {
        this.initialNameLetter = Array.from(user.userName)[0];
      }
  }

  bottomNavRedirection(url, title = "") {
    this.menuSelected=true;
    // this.router.navigate([url]);
    this.checkIfUserLoggedIn(url, title);
  }


  checkIfUserLoggedIn(url, title = "") {
    let user = this.localStorageService.retrieve("user");
    if (user && user.authenticated == "true" || url == '/quickorder' || url == '/login' || url == '/') {
      this.router.navigate([url]);
    } else {
      this.localAuthService.setBackURLTitle(url, title);
      this._commonService.setInitaiteLoginPopUp('/dashboard/order');
    }
  }

  redirectionToSearchPopUp(){
    this._commonService.updateSearchPopup('');
  }

  loadSideNav(){
    this._commonService.setSideNavToggle(true);
  }
  
  setAnalyticTags(channelName) {
		const userSession = this.localAuthService.getUserSession();
		/*Start Adobe Analytics Tags */
		let page = {
			pageName: 'bottom-navigation:home',
			channel: channelName,
			subSection: 'bottom-navigation:'+channelName,
			linkName: this.router.url,
			loginStatus:
				userSession &&
					userSession.authenticated &&
					userSession.authenticated == 'true'
					? 'registered user'
					: 'guest',
		};  
		
		let order = {}; 
		let digitalData = {};
		digitalData['page'] = page;
		digitalData['custData'] = this._commonService.custDataTracking;
		digitalData['order'] = order;
		this.analytics.sendAdobeCall(digitalData);
	}
}
