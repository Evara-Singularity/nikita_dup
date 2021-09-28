import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
@Injectable()
export class MyAccountGuard implements CanActivate {

    private isServer: boolean;
    private isBrowser: boolean;
    constructor(@Inject(PLATFORM_ID) platformId, private localStorageService: LocalStorageService, private router: Router) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // if (this.isServer || GLOBAL_CONSTANT.pageOnWhichBharatPaySupported.includes(window.location.pathname)) {
        //     return true;
        // }

        if (this.localStorageService.retrieve('user')) {
            const user = this.localStorageService.retrieve('user');
            if (user.authenticated === 'false') {
                this.router.navigateByUrl('/login');
                return false;
            }
            if (user.authenticated === 'true') {
                return true;
            } else {
                this.router.navigateByUrl('/login');
                return false;
            }
        } else {
            this.router.navigateByUrl('/login');
            return false;
        }
    }
}
