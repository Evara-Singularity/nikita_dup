import { Component, NgModule, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { CommonModule } from '@angular/common';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'downloadAppPromoBanner',
  templateUrl: './downloadAppPromoBanner.component.html',
  styleUrls: ['./downloadAppPromoBanner.component.scss']
})
export class DownloadAppPromoBannerComponent implements OnInit {

  isOverlayMode: boolean = true;
  appOpenLink=CONSTANTS.APP_OPEN_LINK;
  
  constructor(public commonService: CommonService,private router: Router) { }

  ngOnInit(): void {

  }

  openStore() {
    this.openLink();
  }
  
  openLink() {
    window.open(this.appOpenLink, '_blank');
  }
  
  
 
}




@NgModule({
  declarations: [DownloadAppPromoBannerComponent],
  imports: [
    CommonModule
  ],
  exports: [DownloadAppPromoBannerComponent]
})
export default class DownloadAppPromoBannerModule { }
