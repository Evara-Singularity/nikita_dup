import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({ providedIn: 'root' })
export class NavigationService
{
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
        console.log(currentUrl);
        if (currentUrl === "/") {
          this.history = ['/'];
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
      let defaultUrl = "/";
      //this is to handle google + PDP + back case where we need to redirect to parent category
      if (this.isPDPUrl(currentURL)) {
        defaultUrl = this.breadcrumbCategoryLink;
        this.saveHistory([]);
      }
      //this is to handle checkout + page reload + back case where we need to redirect to quickorder
      if (this.isCheckout(currentURL)) {
        defaultUrl = "/quickorder";
        this.saveHistory([]);
      }
      this.navigate(defaultUrl);
    } else if (this.history.length > 0) {
      const length = this.history.length;
      this.navigate(this.history[length - 1]);
    } else {
      this.navigate("/");
    }
  }

  //this is handle checkout/address with zero items where we will insert quickorder in existing flow;
  handleCartWithZeroItems()
  {
    const oldArray = this.history.filter((url:string)=>url.toLowerCase() !== "/quickorder");
    const newArray = [];
    oldArray.forEach((url)=>{
      if(url.toLowerCase().includes("/checkout/address"))
      {
        newArray.push("/quickorder");
      }
      newArray.push(url);
    })
    this.history = newArray;
    this.saveHistory(this.history);
    this.goBack();
  }

  navigate(url:string)
  {
    if(url === "/")
    {
      this.router.navigateByUrl("/?back=1");
      return;
    }
    this.router.navigateByUrl(url);
  }

  //this is to handle google + PDP + back case where we need to redirect to parent category
  setPDPBreadCrumbData(breadcrumbData) { this.pdpBreadCrumbData = breadcrumbData; }

  //this is to return the parent breadcrum
  get breadcrumbCategoryLink()
  {
    if (this.pdpBreadCrumbData.length === 0) return "/";
    return this.pdpBreadCrumbData[this.pdpBreadCrumbData.length - 2]['categoryLink']
  }

  saveHistory(history) { this._localStorage.store("history", history) }

  getHistory() { return this._localStorage.retrieve("history") }

  isPDPUrl(url: string) { return url.toLowerCase().includes("/mp/msn") }

  isCheckout(url:string){ return url.toLowerCase().includes("checkout/address")}
}
