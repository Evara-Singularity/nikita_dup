import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { LocalAuthService } from '@utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';



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
    public _commonService: CommonService

    ) { }

  ngOnInit() {
    this.isUserLogin = this.localAuthService.isUserLoggedIn();
  }

  bottomNavRedirection(url){
    this.menuSelected=true;
    this.router.navigate([url]);

  }

  redirectionToSearchPopUp(){
    this._commonService.updateSearchPopup('');
  }



}
