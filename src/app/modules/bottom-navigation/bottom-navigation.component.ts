import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { LocalAuthService } from '@utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { LocalStorageService } from 'ngx-webstorage';



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
    if (user && user.authenticated == "true") {
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



}
