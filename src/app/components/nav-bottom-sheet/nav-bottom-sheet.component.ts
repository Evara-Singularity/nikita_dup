import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { BottomMenuModule } from '../../modules/bottomMenu/bottom-menu.module';

@Component({
  selector: 'app-nav-bottom-sheet',
  templateUrl: './nav-bottom-sheet.component.html',
  styleUrls: ['./nav-bottom-sheet.component.scss']
})
export class NavBottomSheetComponent implements OnInit {
  userLogin:boolean;
  @Input() sbm: boolean = true;
  
  constructor(
    private router: Router,
    private _authService:LocalAuthService
  ) { }

  ngOnInit(): void {
    this.checkUserLogin();
  }
  checkUserLogin(){
    let userSession = this._authService.getUserSession();
    if(userSession && userSession.authenticated){
       this.userLogin = false;
    }
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
      this.router.navigate([url]);
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