import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { LocalStorageService } from 'ngx-webstorage';
import { BottomMenuModule } from '../../modules/bottomMenu/bottom-menu.module';

@Component({
  selector: 'app-nav-bottom-sheet',
  templateUrl: './nav-bottom-sheet.component.html',
  styleUrls: ['./nav-bottom-sheet.component.scss']
})
export class NavBottomSheetComponent implements OnInit {
  // userLogin:boolean;
  @Input() sbm: boolean = true;
  @Input() userLogin:boolean;
  
  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private _localAuthService: LocalAuthService,
  ) { }

  ngOnInit(): void {
  }

  resetBottomOpt() {
    this.sbm = false;
  }

  onUpdate(data) {
    if (data.popupClose) {
      this.resetBottomOpt()
    }
  }
  
  resetBottomOptCall(url = null){
    this.sbm = false;
    
    if(url){
      if(url === '/login'){
        let currentUrl: NavigationExtras = { queryParams: {'backurl': this.router.url} };
        this.router.navigate([url], currentUrl);
      }
      else{
        this.router.navigate([url]);
      }
    }
  }

  resetBottomOptCallWithLogin(url = null, title='') {
    this.sbm = false;
    this.checkIfUserLoggedIn(url, title)
  }

  checkIfUserLoggedIn(url, title = "") {
    let user = this.localStorageService.retrieve("user");
    if (user && user.authenticated == "true") {
      this.router.navigate([url]);
    } else {
      this._localAuthService.setBackURLTitle(url, title);
      let navigationExtras: NavigationExtras = {
        queryParams: { 'backurl': url },
      };
      this.router.navigate(['/login'], navigationExtras);
    }
  }
}

@NgModule({
  imports: [
    CommonModule,
    BottomMenuModule,
    RouterModule
  ],
  declarations: [
    NavBottomSheetComponent
  ]
})
export class NavBottomSheetModule {

}