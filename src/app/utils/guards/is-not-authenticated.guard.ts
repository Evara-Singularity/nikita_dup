import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsNotAuthenticatedGuard implements CanActivate {

  private isServer: boolean;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId, private localStorageService: LocalStorageService, private router: Router) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    /**
         * For user urls, avoid account gaurd on server side
         */
    if (this.isServer) {
      return true;
    }
    const user = this.localStorageService.retrieve('user');

    if (!user || (user && user.authenticated === 'false')) {
      return true;
    } else {
      this.router.navigateByUrl('/');
      return false;
    }
  }

}
