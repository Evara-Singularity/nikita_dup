import { NavigationService } from '@app/utils/services/navigation.service';
import { Component } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { CommonService } from './utils/services/common.service';
import CONSTANTS from './config/constants';
import { ProductService } from './utils/services/product.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  pageRefreshed = true;
  popupState = false;
  constructor(private _commonService: CommonService, private router: Router, private _navigationService:NavigationService,private productService: ProductService) {
    if (this._commonService.isBrowser && this.pageRefreshed && window.location.pathname !== '/') {
      const isPayment = window.location.pathname.includes("payment");
      const url = isPayment ? "checkout/address" : '/?back=1';
      window.history.replaceState('', '', url);
      window.history.pushState('', '', this.router.url);
      this.pageRefreshed = false;
      this.handleWindowEvents();
    }
  }
  ngOnInit() {
    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
        const lang = event.url.includes('/hi/') ? 'hi' : 'en';
        document.documentElement.lang = lang;
    });
}

  handleWindowEvents()
  {
    window.addEventListener('popstate', (event) =>
    {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      let backButtonClick = true;
      this.productService.notifyImagePopupState.asObservable().subscribe(status => {
        if(status && backButtonClick) {
          backButtonClick = false;
          this.productService.notifyImagePopupState.next(false);
          return;
        }
      })
      const url = this.router.url;
      if (url !== "/" && !(url.includes("back=1"))) { 
        this._navigationService.goBack(false, true);
      }
      
      // if (window.location.hash === `#${CONSTANTS.PDP_IMAGE_HASH}`){
      //     window.history.replaceState({}, '',`${this.router.url}`);
      //  }
    });
  }
}
