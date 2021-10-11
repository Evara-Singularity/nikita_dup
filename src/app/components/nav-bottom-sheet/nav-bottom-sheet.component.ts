import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
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