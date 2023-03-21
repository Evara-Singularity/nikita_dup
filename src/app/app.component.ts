import { NavigationService } from '@app/utils/services/navigation.service';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from './utils/services/common.service';
import CONSTANTS from './config/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  pageRefreshed = true;

  constructor(private _commonService: CommonService, private router: Router, private _navigationService:NavigationService) {
    if (this._commonService.isBrowser && this.pageRefreshed && window.location.pathname !== '/') {
      const isPayment = window.location.pathname.includes("payment");
      const url = isPayment ? "checkout/address" : '/?back=1';
      window.history.replaceState('', '', url);
      window.history.pushState('', '', this.router.url);
      this.pageRefreshed = false;
      this.handleWindowEvents();
    }
  }

  handleWindowEvents()
  {
    window.addEventListener('popstate', (event) =>
    {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      const url = this.router.url;
      if (url !== "/" && !(url.includes("back=1"))) { 
        this._navigationService.goBack();
      }
      console.log("window.location.hash",window.location.hash);
      if (window.location.hash.toString() == CONSTANTS.PDP_IMAGE_HASH){
         console.log("jsghjsghgsah")
          // window.history.replaceState({}, '',`${this._commonService.currentUrl.split('#')[0]}`);
       }
    });
  }
}
