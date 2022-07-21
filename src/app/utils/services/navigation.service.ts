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
        if (currentUrl === "/") {
          this.history = ['/'];
          this.saveHistory(this.history);
          return;
        }
        const is_not_login_signup = !(currentUrl.includes("login") || currentUrl.includes("otp") || currentUrl.includes("sign-up"));
        let is_not_last_url = true;
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

  //in case of login flow no need to pop
  public goBack(isRemove = false)
  {
    const currentURL = this.router.url;
    this.history = this.getHistory();
    if (!isRemove) { this.history.pop(); }
    this.saveHistory(this.history);
    if (this.history.length === 0) {
      let defaultUrl = "/?back=1";
      if (this.isPDPUrl(currentURL)) {
        defaultUrl = this.breadcrumbCategoryLink;
        this.saveHistory([]);
      }
      this.router.navigate([defaultUrl]);
    } else if (this.history.length > 0) {
      const length = this.history.length;
      this.router.navigate([this.history[length - 1]]);
    } else {
      this.router.navigate(["/?back=1"]);
    }
  }

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

  setPDPBreadCrumbData(breadcrumbData) { this.pdpBreadCrumbData = breadcrumbData; }

  get breadcrumbCategoryLink()
  {
    if (this.pdpBreadCrumbData.length === 0) return "/";
    return this.pdpBreadCrumbData[this.pdpBreadCrumbData.length - 2]['categoryLink']
  }

  saveHistory(history) { this._localStorage.store("history", history) }

  getHistory() { return this._localStorage.retrieve("history") }

  isPDPUrl(url: string) { return url.toLowerCase().includes("/mp/msn") }
}
