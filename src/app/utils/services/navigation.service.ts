import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({ providedIn: 'root' })
export class NavigationService
{
  readonly HOME_URL = "/";
  readonly QUICKORDER_URL = "/quickorder";
  readonly CHECKOUT_URL = "/checkout/address";
  readonly PAYMENT_URL = "checkout/payment";
  private history: string[] = [];
  moduleName = null;
  pdpBreadCrumbData = [];

  constructor(private router: Router, private _localStorage: LocalStorageService)
  {
    this.saveHistory(this.history);
  }

  public startSaveHistory(): void
  {
    this.router.events.subscribe((event) =>
    {
      if (event instanceof NavigationEnd) {
        //const currentUrl = event.urlAfterRedirects;
        const currentUrl = this.router.url;
        if (currentUrl === this.HOME_URL) {
          this.history = [this.HOME_URL];
          this.saveHistory(this.history);
          return;
        }
        //to avoid saving below urls as these are login or signup 
        const is_not_login_signup = !(currentUrl.includes("login") || currentUrl.includes("otp") || currentUrl.includes("sign-up") || currentUrl.includes("back=1"));
        let is_not_last_url = true;
        //to avoid saving of duplication of url
        if (this.history.length > 0) {
          const length = this.history.length;
          const bUrl = this.history[length - 1];
          is_not_last_url = currentUrl !== bUrl;
        }
        if (is_not_login_signup && is_not_last_url) {
          const index = this.history.indexOf(currentUrl);
          if (index > -1) {
            this.history.splice(index, 1)
          }
          //ODP-1866:remove query params from "/checkout/address" and push
          this.history.push(currentUrl);
          this.saveHistory(this.history);
        }
      }
    })
  }

  //in case of login flow no need to pop from history
  public goBack(isRemove = false)
  {
    const currentURL = this.router.url;
    this.history = this.getHistory();
    if (!isRemove) { this.history.pop(); }
    this.saveHistory(this.history);
    if (this.history.length === 0) {
      let defaultUrl = this.HOME_URL;
      //this is to handle (google + PDP + back icon) case where we need to redirect to parent category
      if (this.isPDPUrl(currentURL)) {
        defaultUrl = this.breadcrumbCategoryLink;
        this.saveHistory([]);
      }
      //this is to handle (checkout + page reload + back icon) case where we need to redirect to /quickorder
      if (this.isCheckout(currentURL)) {
        defaultUrl = this.QUICKORDER_URL;
        this.saveHistory([]);
      }
      //this is to handle (checkout + page reload + payment + back icon) case where we need to redirect to checkout/address
      if (this.isPayment(currentURL)) {
        defaultUrl = this.CHECKOUT_URL;
        this.saveHistory([]);
      }
      this.navigate(defaultUrl);
    } else if (this.history.length > 0) {
      const length = this.history.length;
      this.navigate(this.history[length - 1]);
    } else {
      this.navigate(this.HOME_URL);
    }
  }

  //this is handle checkout/address with zero items where we will insert quickorder in existing flow;
  handleCartWithZeroItems()
  {
    const oldArray = this.history.filter((url:string)=>url.toLowerCase() !== this.QUICKORDER_URL);
    const newArray = [];
    oldArray.forEach((url)=>{
      if(url.toLowerCase().includes(this.CHECKOUT_URL))
      {
        newArray.push(this.QUICKORDER_URL);
      }
      newArray.push(url);
    })
    this.history = newArray;
    this.saveHistory(this.history);
    this.goBack();
  }

  navigate(url:string)
  {
    if(url === this.HOME_URL)
    {
      this.router.navigateByUrl("/?back=1");
      return;
    }
    this.router.navigateByUrl(url);
  }

  //this is to return the parent breadcrum
  get breadcrumbCategoryLink()
  {
    if (this.pdpBreadCrumbData.length === 0) return this.HOME_URL;
    return this.pdpBreadCrumbData[this.pdpBreadCrumbData.length - 2]['categoryLink']
  }

  //this is to handle google + PDP + back case where we need to redirect to parent category
  setPDPBreadCrumbData(breadcrumbData) { this.pdpBreadCrumbData = breadcrumbData; }

  saveHistory(history) { this._localStorage.store("history", history) }

  getHistory() { return this._localStorage.retrieve("history") }

  isPDPUrl(url: string) { return url.toLowerCase().includes("/mp/msn") }

  isCheckout(url: string) { return url.toLowerCase().includes(this.CHECKOUT_URL) }
  
  isPayment(url:string){ return url.toLowerCase().includes(this.PAYMENT_URL)}
}
