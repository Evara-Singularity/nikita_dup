import { SessionStorageService, LocalStorageService } from 'ngx-webstorage';
import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavigationService
{
  readonly ALL_CATEGORIES = "/all-categories";
  private history: string[] = [];
  moduleName = null;

  constructor(private router: Router, private _sessionStorage: SessionStorageService, private _localStorage:LocalStorageService)
  {
    this.saveHistory(this.history);
  }

  public startSaveHistory(): void
  {
    this.router.events.subscribe((event) =>
    {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        //console.log(event.urlAfterRedirects);
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
          this.history.push(event.urlAfterRedirects);
          this.saveHistory(this.history);
        }
      }
    })
  }

  public goBack(): void
  {
    const currentURL = this.router.url;
    this.history = this.getHistory();
    console.log("Before", this.history);
    this.history.pop();
    console.log("After", this.history);
    this.saveHistory(this.history);
    //debugger;
    if (this.history.length === 0) {
      if (this.isPDPUrl(currentURL)) {
        this.router.navigateByUrl(this.ALL_CATEGORIES);
      }
      if (this.isAllCategories(currentURL)) {
        this.saveHistory([]);
        this.router.navigateByUrl("/");
      }
      this.router.navigateByUrl("/");
    } else if (this.history.length > 0) {
      const length = this.history.length;
      this.router.navigateByUrl(this.history[length - 1]);
    } else {
      this.router.navigateByUrl("/");
    }
  }

  saveHistory(history) { this._localStorage.store("history", history)  }

  getHistory() { return this._localStorage.retrieve("history") }

  isPDPUrl(url:string) { return url.toLowerCase().includes("/mp/msn") }

  isAllCategories(url: string) { return url == this.ALL_CATEGORIES }
}
