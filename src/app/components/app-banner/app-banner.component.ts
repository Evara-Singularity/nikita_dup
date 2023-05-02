import { Component, OnInit } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';



@Component({
  selector: 'app-app-banner',
  templateUrl: './app-banner.component.html',
  styleUrls: ['./app-banner.component.scss']
})
export class AppBannerComponent implements OnInit {

  isOverlayMode: boolean = true;
  appOpenLink=CONSTANTS.APP_OPEN_LINK;

  constructor(public commonService: CommonService) { }

  ngOnInit(): void {
   
  }

  openStore() {
    this.openLink();
  }
  
  openLink() {
    window.open(this.appOpenLink, '_blank');
  }

}
