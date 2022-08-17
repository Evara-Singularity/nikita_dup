import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { LocalAuthService } from '@utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { LocalStorageService } from 'ngx-webstorage';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';





@Component({
  selector: 'bottom-navigation',
  templateUrl: './bottom-navigation.component.html',
  styleUrls: ['./bottom-navigation.component.scss']
})
export class BottomNavigationComponent implements OnInit {

  menuSelected:boolean=true
  isUserLogin: any;


  constructor(
    private router: Router,
    private localAuthService: LocalAuthService,
    public _commonService: CommonService,
    private localStorageService: LocalStorageService,
    private analytics: GlobalAnalyticsService,
    

    ) { }

  ngOnInit() {
    this.isUserLogin = this.localAuthService.isUserLoggedIn();
  }

  bottomNavRedirection(url, title = "") {
    this.menuSelected=true;
    // this.router.navigate([url]);
    this.checkIfUserLoggedIn(url, title);
  }

  checkIfUserLoggedIn(url, title = "") {
    let user = this.localStorageService.retrieve("user");
    if (user && user.authenticated == "true" || url=='/quickorder' || url == '/login' ) {
      this.router.navigate([url]); 
    } else {
      this.localAuthService.setBackURLTitle(url, title);
      let navigationExtras: NavigationExtras = {
        queryParams: { 'backurl': url },
      };
      this.router.navigate(['/login'], navigationExtras);
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
		let custData = {
			customerID:
				userSession && userSession['userId'] ? btoa(userSession['userId']) : '',
			emailID:
				userSession && userSession['email'] ? btoa(userSession['email']) : '',
			mobile:
				userSession && userSession['phone'] ? btoa(userSession['phone']) : '',
			customerType:
				userSession && userSession['userType'] ? userSession['userType'] : '',
		};
		let order = {}; 
		let digitalData = {};
		digitalData['page'] = page;
		digitalData['custData'] = custData;
		digitalData['order'] = order;
		this.analytics.sendAdobeCall(digitalData);
	}
}
