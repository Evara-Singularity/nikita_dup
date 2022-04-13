import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs';
import { LocalAuthService } from '../services/auth.service';
import { CommonService } from '../services/common.service';

@Injectable()
export class IsNotAuthenticatedCheckoutLogin implements CanActivate {

    private isServer: boolean;
    private isBrowser: boolean;

    constructor(
        private localStorageService: LocalStorageService,
        private router: Router,
        public _commonService: CommonService) {

        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        /**
             * For user urls, avoid account gaurd on server side
             */
        if (this.isServer) {
            return false;
        }
        const user = this.localStorageService.retrieve('user');
        if (!user || (user && user.authenticated === 'true')) {
            this.router.navigateByUrl('/checkout/address');
            return false;
        } else {
            return true;
        }
    }

}
