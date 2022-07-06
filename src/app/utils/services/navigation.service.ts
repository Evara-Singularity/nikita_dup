import { SessionStorageService } from 'ngx-webstorage';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService
{
  private history: string[] = [];

  constructor(private router: Router, private _sessionStorage: SessionStorageService) { }

  public startSaveHistory(): void
  {
    this.router.events.subscribe((event) =>
    {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        //console.log(event.urlAfterRedirects);
        if (currentUrl === "/") {
          this.history = ['/'];
          this._sessionStorage.store("history", this.history);
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
          this._sessionStorage.store("history", this.history);
        }
      }
    })
  }

  public goBack(): void
  {
    this.history = this.getHistory();
    console.log("Before", this.history);
    this.history.pop();
    //console.log("After", this.history);
    this._sessionStorage.store("history", this.history);
    //debugger;
    if (this.history.length > 0) {
      const length = this.history.length;
      this.router.navigateByUrl(this.history[length - 1]);
    } else {
      this.router.navigateByUrl("/");
    }
  }

  getHistory() { return this._sessionStorage.retrieve("history")}
}
